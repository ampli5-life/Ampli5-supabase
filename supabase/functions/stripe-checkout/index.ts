// Supabase Edge Function: Create Stripe Checkout Session
// POST with Bearer JWT; body: { planId: "silver" | "gold" }
// Uses only native fetch (no Stripe SDK, no supabase-js) for Edge Runtime compatibility.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceKey,
      },
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
    const origin = req.headers.get("Origin") ?? req.headers.get("Referer")?.replace(/\/[^/]*$/, "") ?? "";
    const baseUrl = (origin.startsWith("https://") || origin.startsWith("http://"))
      ? origin.replace(/\/$/, "")
      : "http://localhost:5173";
    const successUrl = Deno.env.get("STRIPE_SUCCESS_URL") ?? `${baseUrl}/subscription-success`;
    const cancelUrl = Deno.env.get("STRIPE_CANCEL_URL") ?? `${baseUrl}/pricing`;

    const priceId = planId === "gold" ? goldPriceId : silverPriceId;
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeBody = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: successUrl + (successUrl.includes("?") ? "&" : "?") + "session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY") ?? ""}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripeBody.toString(),
    });

    const sessionData = await stripeRes.json();
    if (sessionData.error) {
      return new Response(
        JSON.stringify({ error: sessionData.error.message ?? "Stripe error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        subscriptionId: sessionData.id,
        approvalUrl: sessionData.url,
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
