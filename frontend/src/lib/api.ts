/**
 * API layer: Supabase client + Edge Functions
 * All backend calls go through Supabase (anon key) or Edge Functions (with Bearer token).
 * service_role key is NEVER used in frontend.
 */

import { supabase, getSupabaseUrl, getAnonKey, getAccessTokenFromStorage } from "./supabase";

const FUNCTIONS_BASE = `${getSupabaseUrl()}/functions/v1`;

export const TOKEN_KEY = "ampli5_token";

/** Returns current access token — reads directly from localStorage, never hangs */
export async function getTokenAsync(): Promise<string | null> {
  return getAccessTokenFromStorage() ?? getToken();
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/a06809ba-2f2d-4027-ad1b-0c709d05e1cc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api.ts:createSubscription:entry', message: 'createSubscription started', data: { planId, functionsBase: FUNCTIONS_BASE }, timestamp: Date.now(), hypothesisId: 'H1' }) }).catch(() => { });
  // #endregion
  const token = await getTokenAsync();
  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }
  setToken(token);
  const res = await fetch(`${FUNCTIONS_BASE}/stripe-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });
  const resData = await res.json().catch(() => ({}));
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/a06809ba-2f2d-4027-ad1b-0c709d05e1cc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api.ts:createSubscription:afterFetch', message: 'stripe-checkout response', data: { status: res.status, ok: res.ok, hasApprovalUrl: !!(resData as { approvalUrl?: string }).approvalUrl, error: (resData as { error?: string }).error }, timestamp: Date.now(), hypothesisId: 'H3' }) }).catch(() => { });
  // #endregion
  if (!res.ok) {
    throw new Error((resData as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return resData as { subscriptionId: string; approvalUrl: string };
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
    throw new Error((data as { error?: string }).error || `Request failed: ${res.status}`);
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
  const empty: SubscriptionStatus = {
    isSubscribed: false,
    plan: "",
    planDisplayName: "",
    startDate: "",
    endDate: "",
  };

  // Use getSession (reads from local storage, never makes network call, never hangs)
  // instead of getUser (makes API call, can hang)
  let userId: string | null = null;
  let accessToken: string | null = null;

  // Use raw token and stored profile to avoid hanging
  try {
    const rawTok = getAccessTokenFromStorage();
    if (rawTok) accessToken = rawTok;

    // We can't decode the JWT without a library, so we fall back to stored profile for userId
  } catch { /* ignore */ }

  // Fallback: try stored profile for user ID
  if (!userId) {
    try {
      const stored = localStorage.getItem("ampli5_profile");
      if (stored) {
        const p = JSON.parse(stored);
        if (p?.id) userId = p.id;
      }
    } catch { /* ignore */ }
  }

  // Use stored token if no session token
  if (!accessToken) {
    accessToken = getToken();
  }

  if (!userId || !accessToken) return empty;

  // Use direct REST API with the user's JWT so RLS policies work
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const now = new Date().toISOString();

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?select=plan_id,start_date,end_date&status=eq.ACTIVE&or=(end_date.is.null,end_date.gte.${now})&order=end_date.desc&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const subs = await res.json();
    if (res.status === 401 || res.status === 403) {
      console.warn("Subscription check failed: Unauthorized. Token might be invalid.");
      return empty;
    }
    if (!Array.isArray(subs) || subs.length === 0) return empty;
    const s = subs[0];
    return {
      isSubscribed: true,
      plan: s.plan_id ?? "",
      planDisplayName: planDisplayName(s.plan_id),
      startDate: s.start_date ? new Date(s.start_date).toISOString() : "",
      endDate: s.end_date ? new Date(s.end_date).toISOString() : "",
    };
  } catch {
    return empty;
  }
}

/** Error thrown when embed returns 403 (subscription required) */
export class EmbedForbiddenError extends Error {
  constructor() {
    super("Embed access forbidden");
  }
}

async function fetchVideoEmbedUrl(
  id: string,
  token: string | null
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${FUNCTIONS_BASE}/video-signed-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ videoId: id }),
  });
}

export async function getVideoEmbedUrl(
  id: string,
  options?: { sendAuth?: boolean }
): Promise<{ embedUrl: string; isDirectVideo?: boolean }> {
  const sendAuth = options?.sendAuth !== false;
  let token = sendAuth ? getToken() : null;

  let res = await fetchVideoEmbedUrl(id, token);

  if (res.status === 403) throw new EmbedForbiddenError();
  if (res.status === 401 && sendAuth) {
    const newToken = await getTokenAsync();
    if (!newToken) {
      setToken(null);
      localStorage.removeItem("ampli5_profile");
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      throw new Error("Session expired. Please log in again.");
    }
    setToken(newToken);
    res = await fetchVideoEmbedUrl(id, newToken);
    if (res.status === 403) throw new EmbedForbiddenError();
    if (res.status === 401) {
      setToken(null);
      localStorage.removeItem("ampli5_profile");
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      throw new Error("Session expired. Please log in again.");
    }
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
      throw new Error(error.message);
    }
    return data as T;
  }

  const method = (options.method ?? "GET").toUpperCase();

  if (method === "GET") {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const token = await getTokenAsync() || supabaseKey;

    if (table === "profiles" && !key) {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load profiles");
      return data as T;
    }
    if (key && table !== "page_content") {
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&id=eq.${key}`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${token}`, Accept: "application/vnd.pgrst.object+json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load item");
      return data as T;
    }
    const sortCol = table === "page_content" ? "page_key" : table === "videos" ? "created_at" : "sort_order";
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&order=${sortCol}.asc`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to load data");
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
      if (!res.ok) throw new Error((data as { error?: string }).error || "Request failed");
      return data as T;
    }

    const body = JSON.parse((options as { body: string }).body ?? "{}") as Record<string, unknown>;
    const insertBody = table === "schedules" ? mapScheduleBody(body) : body;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const tok = await getTokenAsync() || supabaseKey;

    const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${tok}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(insertBody),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || data?.error || "Failed to create");
    return (Array.isArray(data) ? data[0] : data) as T;
  }

  if (method === "PUT" || method === "PATCH") {
    const body = JSON.parse((options as { body: string }).body ?? "{}") as Record<string, unknown>;
    if (!key) throw new Error("ID required for update");

    // Explicitly destructure out admin, isAdmin, id, _id to prevent them polluting our updates block
    const { id: _id, admin, isAdmin, ...rest } = body;
    let updates: Record<string, unknown> = { ...rest };

    if (table === "schedules") updates = mapScheduleBody(updates);

    // Convert boolean admin props to correct DB column name `is_admin`
    if (table === "profiles") {
      if (typeof admin === "boolean") {
        updates.is_admin = admin;
      } else if (typeof isAdmin === "boolean") {
        updates.is_admin = isAdmin;
      }
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const tok = await getTokenAsync() || supabaseKey;

    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${key}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${tok}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || data?.error || "Failed to update");
    return (Array.isArray(data) ? data[0] : data) as T;
  }

  if (method === "DELETE") {
    if (!key) throw new Error("ID required for delete");

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const tok = await getTokenAsync() || supabaseKey;

    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${key}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${tok}`,
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { message?: string })?.message || "Failed to delete");
    }
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
