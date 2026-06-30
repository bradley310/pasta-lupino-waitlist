import { getWaitlist, saveWaitlist } from '../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, table } = req.body;
  const entries = await getWaitlist();
  const updated = entries.map(e =>
    e.id === id ? { ...e, status: 'seated', table: table || '', seatedAt: Date.now() } : e
  );
  await saveWaitlist(updated);

  return res.json({ ok: true });
}
