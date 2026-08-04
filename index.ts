// ═══════════════════════════════════════════════════════════════════════
//  paymongo-create-checkout — called by dashboard.html when a caregiver
//  clicks "Bayaran Ngayon". Creates a PayMongo Checkout Session server-
//  side (so the secret key never touches the browser) with the household
//  ID and plan attached as metadata. The webhook function later reads
//  that same metadata back to know what to activate.
//
//  Why not just a static PayMongo Payment Link with a URL parameter, the
//  way the Stripe version works? Stripe Payment Links have a documented,
//  reliable `client_reference_id` query parameter for exactly this case.
//  PayMongo's no-code Payment Links don't have a confirmed equivalent —
//  but Checkout Sessions, created through the API, do support metadata
//  (confirmed directly in PayMongo's own webhook payload examples). This
//  function is the small trade-off for that reliability: one extra
//  server-side step instead of a plain static link.
// ═══════════════════════════════════════════════════════════════════════

const PAYMONGO_SECRET_KEY = Deno.env.get("PAYMONGO_SECRET_KEY")!;

// ₱ amounts in centavos (PayMongo's smallest currency unit), matching
// the prices already shown in the dashboard's pricing panel.
const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  essential: { amount: 10000, name: "NakNak Essential" },   // ₱100.00
  family:    { amount: 19900, name: "NakNak Family Plan" }, // ₱199.00
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // tighten to your real domain once deployed
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let body: { household_id?: string; plan?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
  }

  const { household_id, plan } = body;
  if (!household_id || !plan || !PLAN_PRICES[plan]) {
    return new Response(JSON.stringify({ error: "household_id and a valid plan ('essential' or 'family') are required" }), { status: 400, headers: corsHeaders });
  }

  const { amount, name } = PLAN_PRICES[plan];
  const origin = req.headers.get("origin") || "https://justineinacay.github.io/Naknak";

  const payMongoRes = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // PayMongo uses HTTP Basic Auth: secret key as username, blank password.
      "Authorization": "Basic " + btoa(`${PAYMONGO_SECRET_KEY}:`),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          description: `${name} — Household ${household_id}`,
          line_items: [{ amount, currency: "PHP", name, quantity: 1 }],
          payment_method_types: ["gcash", "card", "paymaya", "qrph"],
          success_url: `${origin}/dashboard.html?tab=settings&paid=1`,
          cancel_url: `${origin}/dashboard.html?tab=settings`,
          metadata: { household_id, plan },
        },
      },
    }),
  });

  if (!payMongoRes.ok) {
    const errText = await payMongoRes.text();
    console.error("PayMongo checkout session creation failed:", errText);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), { status: 502, headers: corsHeaders });
  }

  const session = await payMongoRes.json();
  const checkout_url = session?.data?.attributes?.checkout_url;

  if (!checkout_url) {
    return new Response(JSON.stringify({ error: "PayMongo did not return a checkout URL" }), { status: 502, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ checkout_url }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
