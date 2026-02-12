import { app } from "../server.js";
import http from "http";
import { Server } from "socket.io";
import messageQueue from "../queue/messageQueue.js";
import { setSocketIO } from "../queue/messageWorker.js";

const userSockets = new Map();

export const websocketController = async () => {
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            credentials: true
        }
    });

    setSocketIO(io);

    io.on("connection", socket => {
        console.log(`Client connected: ${socket.id}`);

        socket.on("register", async (userId) => {
            userSockets.set(userId, socket.id);
            socket.userId = userId;
            console.log(`✅ User ${userId} registered with socket ${socket.id}`);

            const pendingJobs = await messageQueue.getJobs(["waiting", "delayed", "failed"]);
            console.log(`📦 Found ${pendingJobs.length} pending jobs in queue`);
            
            for (const job of pendingJobs) {
                console.log(`🔍 Checking job for recipientUserId: ${job.data.recipientUserId}, current userId: ${userId}`);
                
                if (job.data.recipientUserId === userId) {
                    console.log(`📨 Delivering queued message:`, job.data.messageData);
                    socket.emit("receive-message", job.data.messageData);
                    await job.remove();
                    console.log(`✅ Message ${job.data.messageData.messageId} delivered and removed from queue`);
                }
            }
        });

        socket.on("send-message", async (data) => {
            const { recipientUserId, message, messageId, timestamp } = data;
            
            socket.emit("message-sent", {
                messageId,
                status: "sent",
                timestamp: Date.now()
            });

            const recipientSocketId = userSockets.get(recipientUserId);
            const recipientSocket = recipientSocketId ? io.sockets.sockets.get(recipientSocketId) : null;

            const messageData = {
                messageId,
                senderId: socket.userId,
                message,
                timestamp
            };

            if (recipientSocket && recipientSocket.connected) {
                console.log(`📤 Sending message to online user ${recipientUserId}`);
                recipientSocket.emit("receive-message", messageData);
                
                socket.emit("message-delivered", {
                    messageId,
                    status: "delivered",
                    timestamp: Date.now()
                });
            } else {
                const queueData = {
                    recipientUserId: recipientUserId,
                    messageData
                };
                
                console.log(`📥 User ${recipientUserId} is offline. Queueing message:`, queueData);
                
                await messageQueue.add("deliver-message", queueData, {
                    attempts: 50,
                    backoff: {
                        type: "exponential",
                        delay: 5000
                    },
                    removeOnComplete: false
                });
                
                console.log(`✅ Message ${messageId} queued for offline user: ${recipientUserId}`);
            }
        });

        socket.on("message-delivered-ack", (data) => {
            const { messageId, senderId } = data;
            const senderSocketId = userSockets.get(senderId);
            const senderSocket = senderSocketId ? io.sockets.sockets.get(senderSocketId) : null;

            if (senderSocket && senderSocket.connected) {
                senderSocket.emit("message-delivered", {
                    messageId,
                    status: "delivered",
                    timestamp: Date.now()
                });
            }
        });

        socket.on("message-read", (data) => {
            const { messageId, senderId } = data;
            const senderSocketId = userSockets.get(senderId);
            const senderSocket = senderSocketId ? io.sockets.sockets.get(senderSocketId) : null;

            if (senderSocket && senderSocket.connected) {
                senderSocket.emit("message-read", {
                    messageId,
                    status: "read",
                    timestamp: Date.now()
                });
            }
        });

        socket.on("disconnect", () => {
            if (socket.userId) {
                userSockets.delete(socket.userId);
                console.log(`User ${socket.userId} disconnected`);
            }
        });
    });

    return server;
}