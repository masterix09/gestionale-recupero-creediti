import pkg from "ioredis";
const { RedisOptions } = pkg;

export const redisConnection = {
  host: "db1.ddns.net", // Cambia se usi Docker o un'istanza cloud
  port: 6379,
  maxRetriesPerRequest: null, // ✅ FIX per BullMQ
};
