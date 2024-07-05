import { createClient } from 'redis';

export const redisClient = createClient({
    url: 'redis://localhost:6379',
});

redisClient.on('error', err => console.log('Redis Client Error', err));

redisClient.connect()
    .then(() => {
        console.log('Connected to Redis!')
    })
    .catch(err => {
        console.log(err)

    })

redisClient.on('error', err => {
    console.log(err)
})