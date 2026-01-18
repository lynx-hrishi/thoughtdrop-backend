import { Queue } from "bullmq";
import { redisClient } from "../config/redisConfig.js";

const emailQueue = new Queue("emailQueue", {
    connection: redisClient
});

export default emailQueue;