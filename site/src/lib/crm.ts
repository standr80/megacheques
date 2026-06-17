// Posts a captured website lead to the Event Stuff CRM webhook.
//
// Required env: CRM_WEBHOOK_SECRET  (set in the Vercel project — NEVER commit it)
// Optional env: CRM_WEBHOOK_URL     (defaults to the megacheques-contact endpoint)
//
// Non-fatal by design: if the secret is missing or the CRM is unreachable we log
// and return false rather than throwing, so a CRM problem can never block a
// website enquiry (the email notification is the independent primary path).

const DEFAULT_CRM_URL =
  'https://eventstuff-es-crm.vercel.app/api/webhooks/leads/megacheques-contact';

export interface Lead {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  /** Where the lead came from, e.g. a marketing source or page URL. */
  source?: string;
  /** Which form produced it. */
  form?: string;
}

export async function sendLeadToCrm(lead: Lead): Promise<boolean> {
  const secret = process.env.CRM_WEBHOOK_SECRET;
  const url = process.env.CRM_WEBHOOK_URL ?? DEFAULT_CRM_URL;

  if (!secret) {
    console.warn('[crm] CRM_WEBHOOK_SECRET not set — skipping lead push');
    return false;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? '',
        message: lead.message ?? '',
        source: lead.source ?? 'megacheques.co.uk',
        form: lead.form ?? 'megacheques-contact',
        submitted_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[crm] lead push failed', res.status, text);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[crm] lead push error', e);
    return false;
  }
}
