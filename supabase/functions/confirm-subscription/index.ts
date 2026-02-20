// Supabase Edge Function: Confirm subscription by Stripe session ID
// POST (no auth - called after Stripe redirect); body: { sessionId: "cs_xxx" }
// Validates session via Stripe, upserts subscriptions table

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
    const sessionId = body?.sessionId?.trim();
    if (!sessionId || !sessionId.startsWith("cs_")) {
      return new Response(
        JSON.stringify({ error: "sessionId is required (must start with cs_)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const clientRef = session.client_reference_id;
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    if (!clientRef || !subId) {
      return new Response(
        JSON.stringify({ error: "Invalid checkout session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subId);
    const priceId =
      subscription.items?.data?.[0]?.price?.id ?? null;
    const silverPriceId = Deno.env.get("STRIPE_PRICE_SILVER");
    const goldPriceId = Deno.env.get("STRIPE_PRICE_GOLD");
    let planId = "silver";
    if (priceId === goldPriceId) planId = "gold";
    else if (priceId === silverPriceId) planId = "silver";

    const start = subscription.current_period_start;
    const end = subscription.current_period_end;
    const startDate = start ? new Date(start * 1000).toISOString() : null;
    const endDate = end ? new Date(end * 1000).toISOString() : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subId)
      .single();

    if (existing) {
      await supabase
        .from("subscriptions")
        .update({
          status: "ACTIVE",
          plan_id: planId,
          start_date: startDate,
          end_date: endDate,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("subscriptions").insert({
        user_id: clientRef,
        stripe_subscription_id: subId,
        plan_id: planId,
        status: "ACTIVE",
        start_date: startDate,
        end_date: endDate,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: planId,
        startDate: startDate ?? "",
        endDate: endDate ?? "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Confirmation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
