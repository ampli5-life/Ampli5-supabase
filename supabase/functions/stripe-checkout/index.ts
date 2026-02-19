// Supabase Edge Function: Create Stripe Checkout Session
// POST with Bearer JWT; body: { planId: "silver" | "gold" }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user = await userRes.json();
    const userId = user.id;

    const body = await req.json().catch(() => ({})) as { planId?: string };
    const planId = body?.planId?.toLowerCase();
    if (planId !== "silver" && planId !== "gold") {
      return new Response(
        JSON.stringify({ error: "Invalid planId. Use silver or gold." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const silverPriceId = Deno.env.get("STRIPE_PRICE_SILVER");
    const goldPriceId = Deno.env.get("STRIPE_PRICE_GOLD");
    const successUrl = Deno.env.get("STRIPE_SUCCESS_URL") ?? "http://localhost:5173/subscription-success";
    const cancelUrl = Deno.env.get("STRIPE_CANCEL_URL") ?? "http://localhost:5173/";

    const priceId = planId === "gold" ? goldPriceId : silverPriceId;
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl + (successUrl.includes("?") ? "&" : "?") + "session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });

    return new Response(
      JSON.stringify({
        subscriptionId: session.id,
        approvalUrl: session.url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
