import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set");
}

// Extract project ref from URL for project-specific storage key
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] ?? "default";

// Clean up auth tokens from any old Supabase project to avoid stale session conflicts
try {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Ignore the new auth token so we only rip out the old ones that were causing lock conflicts
    if (key && key.startsWith("sb-") && key.endsWith("-auth-token") && !key.includes(projectRef)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
} catch {
  // ignore storage errors
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: `sb-${projectRef}-auth-token-v2`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function getSupabaseUrl(): string {
  return supabaseUrl;
}

export function getAnonKey(): string {
  return supabaseAnonKey;
}

/**
 * Read access token directly from localStorage — no Supabase client calls,
 * no network requests, no possibility of hanging.
 */
export function getAccessTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem(`sb-${projectRef}-auth-token-v2`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? null;
  } catch {
    return null;
  }
}
