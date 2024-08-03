import 'dotenv/config'; // Đọc biến môi trường từ tệp .env
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
});

redisClient.connect()
    .then(() => {
        console.log('Connected to Redis!');
    })
    .catch((err) => {
        console.log('Error connecting to Redis:', err);
    });
