import Redis from "ioredis";

export const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    maxRetriesPerRequest: null
}); 