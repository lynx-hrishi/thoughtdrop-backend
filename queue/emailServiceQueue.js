import { Queue } from "bullmq";
import { redisClient } from "../config/redisConfig.js";

const emailServiceQueue = new Queue("emailServiceQueue", {
    connection: redisClient
});

export default emailServiceQueue;