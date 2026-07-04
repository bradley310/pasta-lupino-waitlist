import { getWaitlist, saveWaitlist } from '../../lib/kv';
import { sendSMS } from '../../lib/twilio';

function generateToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const entries = await getWaitlist();
    return res.json(entries);
  }

  if (req.method === 'POST') {
    const { name, phone, guests, wait } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Missing fields' });

    const cancelToken = generateToken();
    const entry = {
      id: Date.now().toString(),
      name: name.trim(),
      phone,
      guests,
      wait,
      addedAt: Date.now(),
      status: 'waiting',
      table: '',
      cancelToken,
    };

    const entries = await getWaitlist();
    entries.push(entry);
    await saveWaitlist(entries);

    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/cancel/${cancelToken}`;
    const msg = `Hi ${name}! You're on the waitlist at Pasta Lupino — quoted wait is ${wait} mins. We'll text when your table's ready. To cancel your spot tap here: ${cancelUrl}`;

    try { await sendSMS(phone, msg); } catch (err) { console.error('SMS error:', err.message); }

    return res.json(entry);
  }

  res.status(405).end();
}
