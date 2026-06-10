import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { sendNotification, escapeHtml } from '../../lib/email';

export const prerender = false; // server-rendered endpoint

// Stripe webhook: emails the office when a checkout completes.
// Required env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY
// Configure the endpoint in the Stripe Dashboard → Developers → Webhooks:
//   URL:    https://<your-domain>/api/stripe-webhook
//   Events: checkout.session.completed

export const POST: APIRoute = async ({ request }) => {
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = process.env;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Line items aren't included in the event payload — fetch them.
    let itemsHtml = '<p>(could not load line items)</p>';
    try {
      const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
      itemsHtml = items.data
        .map(
          (li) =>
            `<li>${escapeHtml(li.description ?? 'Item')} × ${li.quantity} — £${((li.amount_total ?? 0) / 100).toFixed(2)} inc VAT</li>`
        )
        .join('');
      itemsHtml = `<ul>${itemsHtml}</ul>`;
    } catch (err) {
      console.error('Could not list line items', err);
    }

    // Shipping details moved between Stripe API versions — check both shapes.
    const s = session as unknown as Record<string, any>;
    const shipping = s.collected_information?.shipping_details ?? s.shipping_details ?? null;
    const addr = shipping?.address;
    const addressHtml = addr
      ? [shipping.name, addr.line1, addr.line2, addr.city, addr.postal_code, addr.country]
          .filter(Boolean)
          .map((part: string) => escapeHtml(part))
          .join('<br>')
      : 'Not provided';

    const chequeDetails =
      session.custom_fields?.find((f) => f.key === 'cheque_details')?.text?.value ?? 'Not provided';

    const html = `
      <h2>🎉 New Mega Cheques order</h2>
      ${itemsHtml}
      <p><strong>Total:</strong> £${((session.amount_total ?? 0) / 100).toFixed(2)} inc VAT</p>
      <p><strong>Customer:</strong> ${escapeHtml(session.customer_details?.name ?? 'Unknown')}
        &lt;${escapeHtml(session.customer_details?.email ?? 'no email')}&gt;</p>
      <p><strong>Phone:</strong> ${escapeHtml(session.customer_details?.phone ?? 'Not provided')}</p>
      <p><strong>Delivery address:</strong><br>${addressHtml}</p>
      <p><strong>Payee name, amount &amp; message (from checkout):</strong><br>${escapeHtml(chequeDetails)}</p>
      <p><strong>Next step:</strong> email the customer to collect logo/artwork and confirm details, then send a proof.</p>
      <p style="color:#64748b;font-size:12px">Stripe session: ${escapeHtml(session.id)}</p>
    `;

    const sent = await sendNotification({
      subject: `New order — £${((session.amount_total ?? 0) / 100).toFixed(2)} — ${session.customer_details?.email ?? ''}`,
      html,
      replyTo: session.customer_details?.email ?? undefined,
    });
    if (!sent) console.error('Order notification email failed for session', session.id);
  }

  return new Response('ok', { status: 200 });
};
