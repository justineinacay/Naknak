// ═══════════════════════════════════════════════════════════════════════
//  paymongo-webhook — PayMongo calls this directly (never the browser)
//  when a checkout session is paid. This is what closes the same
//  self-reported-payment gap the Stripe version closed: a household's
//  plan only changes here, after PayMongo itself confirms real money
//  moved, using a signature PayMongo signs that only PayMongo (and this
//  function, holding the matching secret) can produce.
//
//  Signature format, confirmed directly from PayMongo's documentation
//  (not guessed): the `Paymongo-Signature` header looks like
//    t=1496734173,te=<test-mode-sig>,li=<live-mode-sig>
//  and the value being signed is `${timestamp}.${raw_body}`, HMAC-SHA256
//  hashed with the webhook's own secret_key (whsk_...). Only one of
//  te/li is populated per event, matching whether it's test or live mode.
// ═══════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const webhookSecret = Deno.env.get("PAYMONGO_WEBHOOK_SECRET")!;
const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const sigHeader = req.headers.get("Paymongo-Signature");
  const rawBody = await req.text(); // raw text — required before verification, never JSON.parse first

  if (!sigHeader) {
    return new Response("Missing Paymongo-Signature header", { status: 400 });
  }

  // Parse "t=...,te=...,li=..." into a lookup.
  const parts: Record<string, string> = {};
  for (const kv of sigHeader.split(",")) {
    const [k, v] = kv.split("=");
    if (k) parts[k.trim()] = (v || "").trim();
  }
  const timestamp = parts["t"];
  if (!timestamp) {
    return new Response("Malformed signature header", { status: 400 });
  }

  const timestampSeconds = Number(timestamp);
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (!Number.isFinite(timestampSeconds) || ageSeconds > MAX_SIGNATURE_AGE_SECONDS) {
    return new Response("Expired signature", { status: 400 });
  }

  const expected = await hmacSha256Hex(webhookSecret, `${timestamp}.${rawBody}`);

  // Only one of te/li is populated per event — check whichever is present.
  const candidate = parts["li"] || parts["te"];
  if (!candidate || !timingSafeEqual(expected, candidate)) {
    console.error("Signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = payload?.data?.attributes?.type;
  const eventId = payload?.data?.id;

  if (eventType !== "checkout_session.payment.paid") {
    return new Response(JSON.stringify({ received: true, ignored: eventType }), { status: 200 });
  }
  if (!eventId) {
    return new Response("Missing event id", { status: 400 });
  }

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("naknak_payment_events")
    .select("id")
    .eq("processor_event_id", eventId)
    .maybeSingle();
  if (existingEventError) {
    console.error("Failed to check payment idempotency:", existingEventError.message);
    return new Response("Failed to check event", { status: 500 });
  }
  if (existingEvent) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  const session = payload.data.attributes.data; // the checkout_session resource
  const metadata = session?.attributes?.metadata || {};
  const householdId: string | undefined = metadata.household_id;
  const plan: string | undefined = metadata.plan;
  const paymentAttrs = session?.attributes?.payments?.[0]?.attributes || {};

  if (!householdId || !plan || !["essential", "family"].includes(plan)) {
    console.error(`Missing/invalid metadata on session ${session?.id} — flagged needs_review.`);
    const { error: reviewLogError } = await supabase.from("naknak_payment_events").insert({
      processor_event_id: eventId,
      household_id: null,
      plan: plan ?? null,
      amount_total: paymentAttrs.amount ?? null,
      currency: paymentAttrs.currency ?? "PHP",
      status: "needs_review",
      raw_event: payload,
    });
    if (reviewLogError) {
      console.error("Failed to log payment event for review:", reviewLogError.message);
      return new Response("Failed to log event", { status: 500 });
    }
    return new Response(JSON.stringify({ received: true, warning: "missing or invalid metadata" }), { status: 200 });
  }

  // Legacy Checkout Sessions represent one-time payments. They cannot
  // activate a renewable monthly or annual subscription safely.
  // Preserve verified signed events for reconciliation without granting
  // paid access. A new subscription lifecycle must handle entitlements
  // with server-verified amount, currency, period, renewal and cancellation.
  const amount = Number(paymentAttrs.amount ?? session?.attributes?.amount ?? 0);
  const currency = String(paymentAttrs.currency ?? session?.attributes?.currency ?? '').toUpperCase();
  const legacyPrice = plan === 'family' ? 19900 : 10000;
  const amountMatches = amount === legacyPrice && currency === 'PHP';

  const { error: logError } = await supabase.from('naknak_payment_events').insert({
    processor_event_id: eventId,
    household_id: householdId,
    plan,
    amount_total: Number.isFinite(amount) ? amount : null,
    currency: currency || null,
    status: 'needs_review',
    raw_event: payload,
  });
  if(logError){
    if(logError.code==='23505')
      return new Response(JSON.stringify({received:true,duplicate:true}),{status:200});
    console.error('Failed to preserve payment for review:',logError.message);
    return new Response('Unable to record payment safely',{status:500});
  }
  if(!amountMatches){
    console.error('Legacy payment needs amount/currency reconciliation:',eventId);
  }
  // DO NOT mark an account paid based on a return URL or a one-time
  // checkout. Customer support must reconcile any already paid session.
  return new Response(JSON.stringify({
    received:true,requires_manual_reconciliation:true,activated:false
  }),{status:200});
});
