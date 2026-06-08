import Stripe from 'stripe';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
const prerender = false;
const PRICES = {
  "single-use-cheque": { Mini: 5995, Maxi: 10995, Mega: 17995 },
  "reusable-cheque": { Mini: 7995, Maxi: 12995, Mega: 19995 }
};
const PRODUCT_NAMES = {
  "single-use-cheque": "Single Use Cheque",
  "reusable-cheque": "Reusable Cheque"
};
const SIZE_DIMENSIONS = {
  Mini: "100cm x 50cm",
  Maxi: "150cm x 75cm",
  Mega: "200cm x 100cm"
};
const POST = async ({ request, url }) => {
  const { STRIPE_SECRET_KEY, STRIPE_TAX_RATE_ID } = Object.assign(__vite_import_meta_env__, { _: "/Users/richardstanden/Documents/Exciting New Project/Megacheques/site/node_modules/.bin/astro" });
  if (!STRIPE_SECRET_KEY || !STRIPE_TAX_RATE_ID) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  let product;
  let size;
  try {
    const body = await request.json();
    product = body.product;
    size = body.size;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const unitAmount = PRICES[product]?.[size];
  if (!unitAmount) {
    return new Response(JSON.stringify({ error: "Invalid product or size" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const origin = url.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: unitAmount,
          tax_behavior: "exclusive",
          // VAT added on top
          product_data: {
            name: `${PRODUCT_NAMES[product]} — ${size} (${SIZE_DIMENSIONS[size]})`,
            description: "Custom printed giant novelty cheque. After checkout we will email you to collect your logo, payee name, message and any special requests, then send a proof for your approval before printing."
          }
        },
        quantity: 1,
        tax_rates: [STRIPE_TAX_RATE_ID]
      }
    ],
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["GB"]
    },
    custom_fields: [
      {
        key: "cheque_details",
        label: { type: "custom", custom: "Payee name, amount & any message (we will confirm the design with you)" },
        type: "text",
        optional: true
      }
    ],
    success_url: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/products/${product}/`
  });
  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
