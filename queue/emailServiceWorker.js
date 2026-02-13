import { Worker } from "bullmq";
import dotenv from "dotenv";
import { redisClient } from "../config/redisConfig.js";

dotenv.config({ quiet: true });

const emailServiceWorker = new Worker("emailServiceQueue", async (job) => {
    console.log("Worker on job", job.id);
    const { email, otp } = job.data;

    const mailOptions = {
        to: email,
        subject: "Your Login OTP - ThoughtDrop",
        html: `
            <h2>Your Login OTP</h2>
            <p>Use this OTP to complete your login:</p>
            <h3 style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; letter-spacing: 3px;">${otp}</h3>
            <p>This OTP expires in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    try{
        const res = await fetch(`${process.env.EMAIL_SERVICE_URL}/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mailOptions,
                fromService: process.env.BACKEND_URL,
                toEmail: email
            })
        });
        // console.log({res})
        const data = await res.json();

        if (!res.ok) throw new Error(`Error from email service: ${data.stackTrace}`)
    }
    catch(err){
        throw err;
    }
}, {
    connection: redisClient
});


emailServiceWorker.on("completed", (job) => {
    console.log(`Email sent successfully to ${job.data.email}`);
});

emailServiceWorker.on("failed", (job, err) => {
    console.error(`Email failed for ${job.data.email}:`, err);
});

export default emailServiceWorker;