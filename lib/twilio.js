import twilio from 'twilio';

export async function sendSMS(to, body) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  // Handle international numbers — use as-is if they start with +
  // Otherwise assume North American +1
  const digits = to.replace(/\D/g, '');
  let formatted;
  if (to.startsWith('+')) {
    formatted = to;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    formatted = `+${digits}`;
  } else if (digits.length === 10) {
    formatted = `+1${digits}`;
  } else {
    formatted = `+${digits}`;
  }

  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formatted,
  });
}
