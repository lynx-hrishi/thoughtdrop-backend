# Socket.IO Chat Implementation

## Overview
WhatsApp-style real-time messaging with three message states: **sent**, **delivered**, and **read**. Uses BullMQ queue for offline message handling.

## Message States

1. **Sent** - Message received by server
2. **Delivered** - Message received by recipient's device
3. **Read** - Recipient opened/viewed the message

## Client Events (Emit from Flutter)

### 1. Register User
```javascript
socket.emit("register", userId);
```
- Call immediately after connection
- Maps userId to socketId for message routing
- Delivers any queued offline messages

### 2. Send Message
```javascript
socket.emit("send-message", {
    recipientUserId: "user123",
    message: "Hello!",
    messageId: "unique-msg-id",
    timestamp: 1234567890
});
```

### 3. Acknowledge Delivery
```javascript
socket.emit("message-delivered-ack", {
    messageId: "unique-msg-id",
    senderId: "sender-user-id"
});
```
- Emit when message is received on device

### 4. Mark as Read
```javascript
socket.emit("message-read", {
    messageId: "unique-msg-id",
    senderId: "sender-user-id"
});
```
- Emit when user opens/views the message

## Server Events (Listen in Flutter)

### 1. Message Sent Confirmation
```javascript
socket.on("message-sent", (data) => {
    // data: { messageId, status: "sent", timestamp }
});
```

### 2. Message Delivered
```javascript
socket.on("message-delivered", (data) => {
    // data: { messageId, status: "delivered", timestamp }
});
```

### 3. Message Read
```javascript
socket.on("message-read", (data) => {
    // data: { messageId, status: "read", timestamp }
});
```

### 4. Receive Message
```javascript
socket.on("receive-message", (data) => {
    // data: { messageId, senderId, message, timestamp }
    // Emit "message-delivered-ack" after receiving
});
```

## Offline Message Handling

- Messages to offline users are queued in Redis via BullMQ
- Queue retries delivery 50 times with exponential backoff (5s initial delay)
- When user reconnects and emits "register", all pending messages are delivered
- Messages are automatically removed after successful delivery

## Connection Flow

1. User connects → Socket.IO assigns socketId
2. Flutter emits `register` with userId
3. Server maps userId ↔ socketId
4. Server delivers any queued messages
5. User can send/receive messages in real-time
6. On disconnect, userId mapping is removed

## Environment Variables

Add to `.env`:
```
FRONTEND_URL=http://localhost:3000
```
