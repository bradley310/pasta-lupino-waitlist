import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

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
