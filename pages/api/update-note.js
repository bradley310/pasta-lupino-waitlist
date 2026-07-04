import { getWaitlist, saveWaitlist } from '../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, note } = req.body;
  const entries = await getWaitlist();
  const updated = entries.map(e => e.id === id ? { ...e, note: note || '' } : e);
  await saveWaitlist(updated);
  return res.json({ ok: true });
}
