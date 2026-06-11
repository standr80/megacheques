// Shared email helper — sends notifications via the Resend API.
// Required env: RESEND_API_KEY
// Optional env: CONTACT_TO (default office@eventstuff.ltd),
//               CONTACT_BCC (optional blind copy, e.g. richard@eventstuff.ltd),
//               CONTACT_FROM (default Resend onboarding sender; switch to a
//               verified @megacheques.co.uk sender once the domain is verified in Resend)

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  bcc?: string;
};

// Low-level send via Resend.
export async function sendEmail({ to, subject, html, replyTo, bcc }: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
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

type NotifyArgs = {
  subject: string;
  html: string;
  replyTo?: string;
};

// Internal notification to the office (CONTACT_TO), BCC per CONTACT_BCC.
export async function sendNotification({ subject, html, replyTo }: NotifyArgs): Promise<boolean> {
  return sendEmail({
    to: process.env.CONTACT_TO ?? 'office@eventstuff.ltd',
    bcc: process.env.CONTACT_BCC,
    subject,
    html,
    replyTo,
  });
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
}
