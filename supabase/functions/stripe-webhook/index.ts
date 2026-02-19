// Supabase Edge Function: Stripe Webhook Handler
// POST (no auth); verifies Stripe-Signature

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not set");
    return new Response("OK", { status: 200 });
  }

  const signature = req.headers.get("Stripe-Signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const stripeSubId = sub.id;
    const status = sub.status;
    const newStatus = status === "active" ? "ACTIVE" : "CANCELLED";
    const startTs = sub.current_period_start;
    const endTs = sub.current_period_end;

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", stripeSubId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("subscriptions")
        .update({
          status: newStatus,
          start_date: startTs ? new Date(startTs * 1000).toISOString() : null,
          end_date: endTs ? new Date(endTs * 1000).toISOString() : null,
        })
        .eq("id", existing.id);
    }
  }

  return new Response("OK", { status: 200 });
});
