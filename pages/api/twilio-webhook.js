import { getWaitlist, saveWaitlist } from '../../lib/kv';
import { sendSMS } from '../../lib/twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = (req.body?.Body || '').trim().toUpperCase();
  const from = req.body?.From || '';
  if (body === 'C' || body === 'CANCEL') {
    const entries = await getWaitlist();
    const fromDigits = from.replace(/\D/g, '').slice(-10);
    const entry = entries.find(e => e.phone.replace(/\D/g, '').slice(-10) === fromDigits);
    if (entry && entry.status !== 'seated') {
      const remaining = entries.filter(e => e.id !== entry.id && e.status !== 'seated');
      await saveWaitlist(entries.filter(e => e.id !== entry.id));
      try { await sendSMS(from, `No problem ${entry.name}, you've been removed from the waitlist at Pasta Lupino. Hope to see you soon! 🍷`); } catch {}
      if (process.env.NOTIFY_PHONE) {
        try { await sendSMS(process.env.NOTIFY_PHONE, `❌ ${entry.name} (party of ${entry.guests}) just cancelled via text. ${remaining.length} ${remaining.length === 1 ? 'party' : 'parties'} still waiting.`); } catch {}
      }
    }
  }
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
}

export const config = { api: { bodyParser: { contentType: ['application/x-www-form-urlencoded', 'application/json'] } } };
