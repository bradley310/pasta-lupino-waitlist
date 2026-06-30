import { kv } from '@vercel/kv';

const KEY = 'pl_waitlist';

export async function getWaitlist() {
  try {
    const data = await kv.get(KEY);
    return data || [];
  } catch {
    return [];
  }
}

export async function saveWaitlist(entries) {
  await kv.set(KEY, entries);
}
