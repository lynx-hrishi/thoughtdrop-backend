import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const configuration = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587, // 465 or 587
  secure: Number(process.env.SMTP_PORT) === 587 ? false : true, // true for 465, false for 587
  requireTLS: Number(process.env.SMTP_PORT) === 587 ? true : false, // true for 587, false for 465
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport({ ...configuration });

export { transporter };