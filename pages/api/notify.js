import { getWaitlist, saveWaitlist } from '../../lib/kv';
import { sendSMS } from '../../lib/twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, table } = req.body;
  const entries = await getWaitlist();
  const entry = entries.find(e => e.id === id);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/cancel/${entry.cancelToken}`;
  const tableText = table ? `Your table is number ${table}. ` : '';
  const msg = `Hi ${entry.name}! Your table at Pasta Lupino is ready — please come in now. ${tableText}We'll hold it for 5 minutes. See you soon! 🍝 If you no longer need your table tap here: ${cancelUrl}`;

  try { await sendSMS(entry.phone, msg); } catch (err) { return res.status(500).json({ error: 'SMS failed: ' + err.message }); }

  const updated = entries.map(e => e.id === id ? { ...e, status: 'notified', notifiedAt: Date.now(), table: table || e.table } : e);
  await saveWaitlist(updated);

  return res.json({ ok: true });
}
