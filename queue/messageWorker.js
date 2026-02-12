import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig.js";

let io = null;

export const setSocketIO = (socketIO) => {
    io = socketIO;
    console.log("✅ Socket.IO instance set in message worker");
};

const messageWorker = new Worker("messageQueue", async (job) => {
    const { recipientUserId, messageData } = job.data;
    
    console.log(`🔄 Worker processing job for user: ${recipientUserId}, messageId: ${messageData.messageId}`);
    
    if (!io) {
        console.log("❌ Socket.IO not initialized in worker");
        throw new Error("Socket.IO not initialized");
    }
    
    const sockets = await io.fetchSockets();
    const recipientSocket = sockets.find(s => s.userId === recipientUserId);
    
    if (recipientSocket && recipientSocket.connected) {
        console.log(`✅ Found online recipient ${recipientUserId}, delivering message`);
        recipientSocket.emit("receive-message", messageData);
        return { delivered: true, recipientUserId };
    }
    
    console.log(`⏳ Recipient ${recipientUserId} still offline, will retry`);
    throw new Error("Recipient offline");
}, {
    connection: redisClient,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 }
});

messageWorker.on("completed", (job) => {
    console.log(`✅ Message ${job.data.messageData.messageId} delivered to ${job.data.recipientUserId}`);
});

messageWorker.on("failed", (job, err) => {
    console.log(`❌ Message delivery failed for ${job.data.recipientUserId}: ${err.message}`);
});

export default messageWorker;
