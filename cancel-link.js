import { getWaitlist, saveWaitlist } from '../../lib/kv';
import { sendSMS } from '../../lib/twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token } = req.body;
  const entries = await getWaitlist();
  const entry = entries.find(e => e.cancelToken === token);
  if (!entry) return res.status(404).json({ error: 'Not found or already cancelled' });
  if (entry.status === 'seated') return res.status(400).json({ error: 'Already seated' });
  const remaining = entries.filter(e => e.id !== entry.id && e.status !== 'seated');
  await saveWaitlist(entries.filter(e => e.id !== entry.id));
  if (process.env.NOTIFY_PHONE) {
    try { await sendSMS(process.env.NOTIFY_PHONE, `❌ ${entry.name} (party of ${entry.guests}) just cancelled via link. ${remaining.length} ${remaining.length === 1 ? 'party' : 'parties'} still waiting.`); } catch {}
  }
  return res.json({ ok: true, name: entry.name });
}
