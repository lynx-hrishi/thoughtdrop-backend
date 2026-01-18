import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig.js";

const emailWorker = new Worker("emailQueue", async (job) => {
    const { email, otp, type } = job.data;
    
    console.log(`Processing ${type} email for ${email}`);
    console.log(`Magic Link OTP: ${otp}`);
    
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log the magic link
    console.log(`Magic Link: ${process.env.BACKEND_URL}/verify?email=${email}&otp=${otp}`);
    
    return { success: true, email, otp };
}, {
    connection: redisClient,
    concurrency: 20
});

emailWorker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`Email job ${job.id} failed:`, err);
});

export default emailWorker; 