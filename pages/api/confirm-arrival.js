import { getWaitlist, saveWaitlist } from '../../lib/kv';
import { sendSMS } from '../../lib/twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token } = req.body;
  const entries = await getWaitlist();
  const entry = entries.find(e => e.cancelToken === token);

  if (!entry) return res.status(404).json({ error: 'Not found' });
  if (entry.status === 'seated' || entry.status === 'cancelled') {
    return res.status(400).json({ error: 'Already resolved' });
  }

  const updated = entries.map(e =>
    e.id === entry.id ? { ...e, status: 'ontheway', confirmedAt: Date.now() } : e
  );
  await saveWaitlist(updated);

  // Notify restaurant staff
  if (process.env.NOTIFY_PHONE) {
    try {
      await sendSMS(
        process.env.NOTIFY_PHONE,
        `✅ ${entry.name} (party of ${entry.guests}) is on their way — table ${entry.table || '?'} should be ready!`
      );
    } catch {}
  }

  return res.json({ ok: true, name: entry.name });
}
