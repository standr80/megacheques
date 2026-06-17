import type { APIRoute } from 'astro';
import { sendNotification, escapeHtml } from '../../lib/email';
import { sendLeadToCrm } from '../../lib/crm';

export const prerender = false; // server-rendered endpoint

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const message = String(body.message ?? '').trim();
  const honeypot = String(body.website ?? '');

  // Bots fill the hidden "website" field — pretend success, send nothing.
  if (honeypot) return json({ ok: true });

  if (!name || !email || !message) {
    return json({ error: 'Please fill in your name, email and message.' }, 400);
  }
  if (name.length > 200 || email.length > 200 || phone.length > 50 || message.length > 5000) {
    return json({ error: 'Your message is too long.' }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const html = `
    <h2>New enquiry from the Mega Cheques website</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  // Email (primary) and CRM lead push run together. The CRM call is non-fatal:
  // its result doesn't affect what the visitor sees, so a CRM outage never
  // blocks an enquiry.
  const [ok] = await Promise.all([
    sendNotification({
      subject: `Website enquiry from ${name}`,
      html,
      replyTo: email,
    }),
    sendLeadToCrm({ name, email, phone, message, source: 'megacheques.co.uk', form: 'megacheques-contact' }),
  ]);

  return ok
    ? json({ ok: true })
    : json({ error: 'Sorry, we could not send your message. Please email or call us directly.' }, 500);
};
