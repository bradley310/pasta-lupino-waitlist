import { getWaitlist, saveWaitlist } from '../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.body;
  const entries = await getWaitlist();
  await saveWaitlist(entries.filter(e => e.id !== id));
  return res.json({ ok: true });
}
