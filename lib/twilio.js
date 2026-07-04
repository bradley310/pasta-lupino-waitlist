import twilio from 'twilio';

export async function sendSMS(to, body) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const digits = to.replace(/\D/g, '');
  let formatted;

  if (to.trim().startsWith('+')) {
    // Already has country code — use as-is (strips spaces/dashes)
    formatted = '+' + digits;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // North American with leading 1
    formatted = `+${digits}`;
  } else if (digits.length === 10) {
    // North American without leading 1
    formatted = `+1${digits}`;
  } else {
    // Best guess — prepend +
    formatted = `+${digits}`;
  }

  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formatted,
  });
}
