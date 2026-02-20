// Supabase Edge Function: Get video embed/signed URL
// POST with Bearer JWT; body: { videoId: "uuid" }
// Free videos: return YouTube embed URL
// Paid videos: check subscription, return Supabase Storage signed URL (60s) if storage_path set

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_PATTERN = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

function extractYoutubeVideoId(url: string | null): string | null {
  if (!url?.trim()) return null;
  const m = url.trim().match(YOUTUBE_PATTERN);
  return m ? m[1] : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = (await req.json().catch(() => ({}))) as { videoId?: string };
    const videoId = body?.videoId?.trim();
    if (!videoId) {
      return new Response(
        JSON.stringify({ message: "videoId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("id, title, is_paid, youtube_url, storage_path")
      .eq("id", videoId)
      .single();

    if (videoError || !video) {
      return new Response(
        JSON.stringify({ message: "Video not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!video.is_paid) {
      const ytId = extractYoutubeVideoId(video.youtube_url);
      if (!ytId) {
        return new Response(
          JSON.stringify({ message: "Invalid YouTube URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ embedUrl: `https://www.youtube.com/embed/${ytId}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ message: "Authentication required for paid content" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = user.id;

    const nowIso = new Date().toISOString();
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .or(`end_date.is.null,end_date.gte.${nowIso}`)
      .maybeSingle();

    if (!sub) {
      return new Response(
        JSON.stringify({ message: "Active subscription required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (video.storage_path) {
      // Increased to 24 hours (86400) so videos don't stop loading after a pause
      const { data: signed, error: signError } = await supabase.storage
        .from("videos")
        .createSignedUrl(video.storage_path, 86400);

      if (signError || !signed?.signedUrl) {
        return new Response(
          JSON.stringify({ message: "Failed to generate video URL" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ embedUrl: signed.signedUrl, isDirectVideo: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ytId = extractYoutubeVideoId(video.youtube_url);
    if (ytId) {
      return new Response(
        JSON.stringify({ embedUrl: `https://www.youtube.com/embed/${ytId}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "No video source configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ message: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
