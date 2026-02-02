import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
}); 

redisClient.on('error', err => console.log('Redis Client Error', err));