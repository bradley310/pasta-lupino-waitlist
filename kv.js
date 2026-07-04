import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'pl_waitlist';

export async function getWaitlist() {
  try {
    const data = await redis.get(KEY);
    return data || [];
  } catch {
    return [];
  }
}

export async function saveWaitlist(entries) {
  await redis.set(KEY, entries);
}
