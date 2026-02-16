function getApiBase(): string {
  const url = import.meta.env.VITE_API_URL;
  if (url == null || url === "") return "/api";
  const base = String(url).trim().replace(/\/$/, "");
  const result = base.endsWith("/api") ? base : `${base}/api`;
  return result.replace(/\/$/, "");
}
const API_BASE = getApiBase();

export const TOKEN_KEY = "ampli5_token";

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

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: ApiUser } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || "Invalid email or password" };
    }
    return { token: data.token, user: data.user };
  } catch {
    return { error: "Network error. Is the backend running?" };
  }
}

export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<{ token: string; user: ApiUser } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || "Registration failed" };
    }
    return { token: data.token, user: data.user };
  } catch {
    return { error: "Network error. Is the backend running?" };
  }
}

export async function loginWithGoogle(
  idToken: string
): Promise<{ token: string; user: ApiUser } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || "Google sign-in failed" };
    return { token: data.token, user: data.user };
  } catch {
    return { error: "Network error. Is the backend running?" };
  }
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: string;
  planDisplayName: string;
  startDate: string;
  endDate: string;
}

export async function createSubscription(
  planId: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  return apiFetch<{ subscriptionId: string; approvalUrl: string }>("/subscriptions/create", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

export async function confirmSubscription(subscriptionIdOrSessionId: string): Promise<{
  success: boolean;
  plan: string;
  startDate: string;
  endDate: string;
}> {
  const body =
    subscriptionIdOrSessionId.startsWith("cs_")
      ? { sessionId: subscriptionIdOrSessionId }
      : { subscriptionId: subscriptionIdOrSessionId };
  return apiFetch<{ success: boolean; plan: string; startDate: string; endDate: string }>(
    "/subscriptions/confirm",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return apiFetch<SubscriptionStatus>("/subscriptions/status");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    setToken(null);
    localStorage.removeItem("ampli5_profile");
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Convenience for GET requests with auth (e.g. from components that need simple fetch) */
export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, { ...options, method: options.method || "GET" });
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
