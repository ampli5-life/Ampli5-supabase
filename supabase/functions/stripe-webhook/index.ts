// Supabase Edge Function: Stripe Webhook Handler
// POST (no auth); verifies Stripe-Signature

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@11.2.0?target=deno";
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
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return new Response("Webhook not configured", { status: 500 });
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clientRef = session.client_reference_id;
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (clientRef && subId) {
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subId)
        .maybeSingle();
      if (!existing) {
        const subscription = await stripe.subscriptions.retrieve(subId);
        const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
        const silverPriceId = Deno.env.get("STRIPE_PRICE_SILVER");
        const goldPriceId = Deno.env.get("STRIPE_PRICE_GOLD");
        let planId = "silver";
        if (priceId === goldPriceId) planId = "gold";
        else if (priceId === silverPriceId) planId = "silver";
        const startTs = subscription.current_period_start;
        const endTs = subscription.current_period_end;
        const startDate = startTs ? new Date(startTs * 1000).toISOString() : null;
        const endDate = endTs ? new Date(endTs * 1000).toISOString() : null;
        await supabase.from("subscriptions").insert({
          user_id: clientRef,
          stripe_subscription_id: subId,
          plan_id: planId,
          status: "ACTIVE",
          start_date: startDate,
          end_date: endDate,
        });
      }
    }
  }

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
