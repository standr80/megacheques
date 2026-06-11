// Shared email helper — sends notifications via the Resend API.
// Required env: RESEND_API_KEY
// Optional env: CONTACT_TO (default office@eventstuff.ltd),
//               CONTACT_BCC (optional blind copy, e.g. richard@eventstuff.ltd),
//               CONTACT_FROM (default Resend onboarding sender; switch to a
//               verified @megacheques.co.uk sender once the domain is verified in Resend)

type EmailArgs = {
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendNotification({ subject, html, replyTo }: EmailArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? 'office@eventstuff.ltd';
  const bcc = process.env.CONTACT_BCC;
  const from = process.env.CONTACT_FROM ?? 'Mega Cheques Website <onboarding@resend.dev>';

  if (!key) {
    console.error('RESEND_API_KEY is not set — cannot send email');
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      ...(bcc ? { bcc: [bcc] } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error('Resend API error', res.status, await res.text());
  }
  return res.ok;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
}
