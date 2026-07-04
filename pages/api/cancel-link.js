import { getWaitlist, saveWaitlist } from '../../lib/kv';
import { sendSMS } from '../../lib/twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token } = req.body;
  const entries = await getWaitlist();
  const entry = entries.find(e => e.cancelToken === token);

  if (!entry) return res.status(404).json({ error: 'Not found or already cancelled' });
  if (entry.status === 'seated') return res.status(400).json({ error: 'Already seated' });

  // Mark as cancelled instead of deleting so app can show alert
  const updated = entries.map(e =>
    e.id === entry.id ? { ...e, status: 'cancelled', cancelledAt: Date.now() } : e
  );
  await saveWaitlist(updated);

  // Notify restaurant staff
  if (process.env.NOTIFY_PHONE) {
    try {
      const remaining = entries.filter(e => e.id !== entry.id && e.status !== 'seated').length;
      await sendSMS(process.env.NOTIFY_PHONE, `❌ ${entry.name} (party of ${entry.guests}) just cancelled via link. ${remaining} ${remaining === 1 ? 'party' : 'parties'} still waiting.`);
    } catch {}
  }

  return res.json({ ok: true, name: entry.name });
}
