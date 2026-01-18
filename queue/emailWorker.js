import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig.js";
import { transporter } from "../utils/sendEmail.js";

const emailWorker = new Worker("emailQueue", async (job) => {
    const { email, otp, type } = job.data;
    
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
        const res = await transporter.sendMail(mailOptions);
        console.log({res})
        return res;
    }
    catch(err){
        throw err;
    }
    // return { success: true, email };
}, {
    connection: redisClient
});

emailWorker.on("completed", (job) => {
    console.log(`Email sent successfully to ${job.data.email}`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`Email failed for ${job.data.email}:`, err);
});

export default emailWorker;