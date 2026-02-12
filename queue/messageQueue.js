import { Queue } from "bullmq";
import { redisClient } from "../config/redisConfig.js";

const messageQueue = new Queue("messageQueue", {
    connection: redisClient
});

export default messageQueue;
