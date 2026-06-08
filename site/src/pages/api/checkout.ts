import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false; // server-rendered endpoint

// Prices in pence (ex-VAT) — single source of truth
const PRICES: Record<string, Record<string, number>> = {
  'single-use-cheque': { Mini: 5995, Maxi: 10995, Mega: 17995 },
  'reusable-cheque':   { Mini: 7995, Maxi: 12995, Mega: 19995 },
};

const PRODUCT_NAMES: Record<string, string> = {
  'single-use-cheque': 'Single Use Cheque',
  'reusable-cheque':   'Reusable Cheque',
};

const SIZE_DIMENSIONS: Record<string, string> = {
  Mini: '100cm x 50cm',
  Maxi: '150cm x 75cm',
  Mega: '200cm x 100cm',
};

export const POST: APIRoute = async ({ request, url }) => {
  const { STRIPE_SECRET_KEY, STRIPE_TAX_RATE_ID } = import.meta.env;

  if (!STRIPE_SECRET_KEY || !STRIPE_TAX_RATE_ID) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let product: string;
  let size: string;

  try {
    const body = await request.json();
    product = body.product;
    size = body.size;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const unitAmount = PRICES[product]?.[size];
  if (!unitAmount) {
    return new Response(JSON.stringify({ error: 'Invalid product or size' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const origin = url.origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          unit_amount: unitAmount,
          tax_behavior: 'exclusive', // VAT added on top
          product_data: {
            name: `${PRODUCT_NAMES[product]} — ${size} (${SIZE_DIMENSIONS[size]})`,
            description:
              'Custom printed giant novelty cheque. After checkout we will email you to collect your logo, payee name, message and any special requests, then send a proof for your approval before printing.',
          },
        },
        quantity: 1,
        tax_rates: [STRIPE_TAX_RATE_ID],
      },
    ],
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['GB'],
    },
    custom_fields: [
      {
        key: 'cheque_details',
        label: { type: 'custom', custom: 'Payee name, amount & any message (we will confirm the design with you)' },
        type: 'text',
        optional: true,
      },
    ],
    success_url: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/products/${product}/`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
