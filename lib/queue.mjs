import { Queue } from "bullmq";

const connection = { connection: { host: process.env.REDIS_URL } };
export const personaQueue = new Queue("personaQueue", connection);
