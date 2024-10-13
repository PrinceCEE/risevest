import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

const connectCache = async (url: string) => {
  redisClient = createClient({ url });
  await redisClient.connect();
};

const set = (key: string, value: any) => {
  return redisClient.set(key, JSON.stringify(value), { EX: 900 }); // cache for 15mins
};

const get = async (key: string) => {
  return redisClient.get(key).then((d) => JSON.parse(d as string));
};

const disconnectCache = () => redisClient.quit();

export const cache = { connectCache, set, get, disconnectCache };
