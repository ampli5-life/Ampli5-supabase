/**
 * API layer: Supabase client + Edge Functions
 * All backend calls go through Supabase (anon key) or Edge Functions (with Bearer token).
 * service_role key is NEVER used in frontend.
 */

import { supabase, getSupabaseUrl } from "./supabase";

const FUNCTIONS_BASE = `${getSupabaseUrl()}/functions/v1`;

export const TOKEN_KEY = "ampli5_token";

/** Returns current Supabase session access token for Edge Function auth */
export async function getTokenAsync(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Sync getToken - reads from localStorage (kept in sync by AuthContext) */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: string;
  planDisplayName: string;
  startDate: string;
  endDate: string;
}

function planDisplayName(planId: string | null): string {
  if (!planId) return "";
  if (planId.toLowerCase() === "gold") return "Gold";
  if (planId.toLowerCase() === "silver") return "Silver";
  return planId;
}

export async function createSubscription(
  planId: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const token = await getTokenAsync();
  if (!token) throw new Error("Authentication required");
  const res = await fetch(`${FUNCTIONS_BASE}/stripe-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return data as { subscriptionId: string; approvalUrl: string };
}

export async function confirmSubscriptionBySession(sessionId: string): Promise<{
  success: boolean;
  plan: string;
  startDate: string;
  endDate: string;
}> {
  const res = await fetch(`${FUNCTIONS_BASE}/confirm-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${res.status}`);
  }
  return data as { success: boolean; plan: string; startDate: string; endDate: string };
}

export async function confirmSubscription(subscriptionIdOrSessionId: string): Promise<{
  success: boolean;
  plan: string;
  startDate: string;
  endDate: string;
}> {
  if (subscriptionIdOrSessionId.startsWith("cs_")) {
    return confirmSubscriptionBySession(subscriptionIdOrSessionId);
  }
  throw new Error("Invalid session ID. Use the session_id from the Stripe success URL (starts with cs_).");
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      isSubscribed: false,
      plan: "",
      planDisplayName: "",
      startDate: "",
      endDate: "",
    };
  }
  const now = new Date().toISOString();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("plan_id, start_date, end_date")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("end_date", { ascending: false })
    .limit(1);

  if (!subs || subs.length === 0) {
    return {
      isSubscribed: false,
      plan: "",
      planDisplayName: "",
      startDate: "",
      endDate: "",
    };
  }
  const s = subs[0];
  return {
    isSubscribed: true,
    plan: s.plan_id ?? "",
    planDisplayName: planDisplayName(s.plan_id),
    startDate: s.start_date ? new Date(s.start_date).toISOString() : "",
    endDate: s.end_date ? new Date(s.end_date).toISOString() : "",
  };
}

/** Error thrown when embed returns 403 (subscription required) */
export class EmbedForbiddenError extends Error {
  constructor() {
    super("Embed access forbidden");
  }
}

export async function getVideoEmbedUrl(id: string): Promise<{ embedUrl: string; isDirectVideo?: boolean }> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${FUNCTIONS_BASE}/video-signed-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ videoId: id }),
  });

  if (res.status === 403) throw new EmbedForbiddenError();
  if (res.status === 401) {
    setToken(null);
    localStorage.removeItem("ampli5_profile");
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<{ embedUrl: string; isDirectVideo?: boolean }>;
}

// Path to Supabase table mapping for content
const PATH_TO_TABLE: Record<string, string> = {
  "/videos": "videos",
  "/blog": "blog_posts",
  "/testimonials": "testimonials",
  "/team": "team_members",
  "/schedules": "schedules",
  "/events": "events",
  "/books": "books",
  "/video-channels": "video_channels",
  "/apps": "apps",
  "/recommended-readings": "recommended_readings",
  "/faqs": "faqs",
  "/page-content": "page_content",
  "/users": "profiles",
};

function mapScheduleBody(body: Record<string, unknown>): Record<string, unknown> {
  const mapped = { ...body };
  if ("dayOfWeek" in mapped) {
    mapped.day_of_week = mapped.dayOfWeek;
    delete mapped.dayOfWeek;
  }
  if ("className" in mapped) {
    mapped.class_name = mapped.className;
    delete mapped.className;
  }
  return mapped;
}

function resolveTable(path: string): { table: string; key?: string; pageKey?: boolean } | null {
  const normalized = path.replace(/^\/+/, "").replace(/\/$/, "");
  if (normalized.startsWith("page-content/key/")) {
    return { table: "page_content", key: normalized.replace("page-content/key/", ""), pageKey: true };
  }
  const parts = normalized.split("/");
  const base = "/" + parts[0];
  const table = PATH_TO_TABLE[base];
  if (!table) return null;
  const key = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return { table, key, pageKey: false };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const resolved = resolveTable(path);
  if (!resolved) {
    throw new Error(`Unknown API path: ${path}`);
  }

  const { table, key, pageKey } = resolved;

  if (table === "page_content" && key) {
    if (options.method === "PUT" && (options as { body?: string }).body) {
      const body = JSON.parse((options as { body: string }).body) as {
        pageKey?: string;
        contentJson?: string;
      };
      if (pageKey) {
        const { error: upsertError } = await supabase
          .from("page_content")
          .upsert({ page_key: key, content_json: body.contentJson ?? "" }, { onConflict: "page_key" });
        if (upsertError) throw new Error(upsertError.message);
      } else {
        const { error: updateError } = await supabase
          .from("page_content")
          .update({ page_key: body.pageKey ?? key, content_json: body.contentJson ?? "" })
          .eq("id", key);
        if (updateError) throw new Error(updateError.message);
      }
      return { contentJson: body.contentJson } as T;
    }
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_key", key)
      .maybeSingle();
    if (error) {
      if (import.meta.env.DEV) {
        try { fetch('http://127.0.0.1:7244/ingest/a06809ba-2f2d-4027-ad1b-0c709d05e1cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:page_content_key',message:'Supabase page_content error',data:{key,errorMessage:error.message},timestamp:Date.now(),hypothesisId:'H5'})}); } catch (_) {}
      }
      throw new Error(error.message);
    }
    return data as T;
  }

  const method = (options.method ?? "GET").toUpperCase();

  if (method === "GET") {
    if (table === "profiles" && !key) {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw new Error(error.message);
      return data as T;
    }
    if (key && table !== "page_content") {
      const { data, error } = await supabase.from(table).select("*").eq("id", key).single();
      if (error) throw new Error(error.message);
      return data as T;
    }
    const sortCol = table === "page_content" ? "page_key" : table === "videos" ? "created_at" : "sort_order";
    const { data, error } = await supabase.from(table).select("*").order(sortCol, { ascending: true });
    if (error) {
      if (import.meta.env.DEV) {
        try { fetch('http://127.0.0.1:7244/ingest/a06809ba-2f2d-4027-ad1b-0c709d05e1cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:GET',message:'Supabase GET error',data:{table,path,errorMessage:error.message},timestamp:Date.now(),hypothesisId:'H5'})}); } catch (_) {}
      }
      throw new Error(error.message);
    }
    return data as T;
  }

  if (method === "POST") {
    if (path === "/users" && table === "profiles") {
      const body = JSON.parse((options as { body: string }).body ?? "{}") as {
        email?: string;
        password?: string;
        fullName?: string;
        admin?: boolean;
      };
      const token = getToken();
      if (!token) throw new Error("Authentication required");
      const res = await fetch(`${FUNCTIONS_BASE}/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Request failed");
      return data as T;
    }
    if (path === "/contact") {
      const body = JSON.parse((options as { body: string }).body ?? "{}") as {
        name?: string;
        email?: string;
        message?: string;
      };
      const res = await fetch(`${FUNCTIONS_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message || "Request failed");
      return data as T;
    }

    const body = JSON.parse((options as { body: string }).body ?? "{}") as Record<string, unknown>;
    const insertBody = table === "schedules" ? mapScheduleBody(body) : body;
    const { data, error } = await supabase.from(table).insert(insertBody).select().single();
    if (error) throw new Error(error.message);
    return data as T;
  }

  if (method === "PUT" || method === "PATCH") {
    const body = JSON.parse((options as { body: string }).body ?? "{}") as Record<string, unknown>;
    if (!key) throw new Error("ID required for update");
    const { id: _id, admin, ...rest } = body;
    let updates: Record<string, unknown> = { ...rest };
    if (table === "schedules") updates = mapScheduleBody(updates);
    if (table === "profiles" && typeof admin === "boolean") {
      (updates as Record<string, unknown>).is_admin = admin;
    }
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("id", key)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as T;
  }

  if (method === "DELETE") {
    if (!key) throw new Error("ID required for delete");
    const { error } = await supabase.from(table).delete().eq("id", key);
    if (error) throw new Error(error.message);
    return undefined as T;
  }

  throw new Error(`Unsupported method: ${method}`);
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
