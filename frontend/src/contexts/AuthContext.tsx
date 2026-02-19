import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  getToken,
  setToken,
  TOKEN_KEY,
  getSubscriptionStatus,
  type SubscriptionStatus,
} from "@/lib/api";

const PROFILE_KEY = "ampli5_profile";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
}

interface SubscriptionInfo {
  plan: string;
  planDisplayName: string;
  startDate: string;
  endDate: string;
}

interface AuthContextValue {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: { message: string } | null }>;
  signInWithGoogle: (idToken: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
  isSubscribed: boolean;
  subscriptionInfo: SubscriptionInfo | null;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileFromUser(user: { id: string; email?: string }, profileRow?: { full_name?: string; avatar_url?: string | null; is_admin?: boolean } | null): Profile {
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profileRow?.full_name ?? (user as { user_metadata?: { full_name?: string; name?: string } }).user_metadata?.full_name ?? (user as { user_metadata?: { full_name?: string; name?: string } }).user_metadata?.name ?? "User",
    avatar_url: profileRow?.avatar_url ?? (user as { user_metadata?: { avatar_url?: string } }).user_metadata?.avatar_url ?? null,
    is_admin: profileRow?.is_admin ?? false,
  };
}

function subscriptionInfoFromStatus(s: SubscriptionStatus | null): SubscriptionInfo | null {
  if (!s || (!s.plan && !s.startDate && !s.endDate)) return null;
  return {
    plan: s.plan || "",
    planDisplayName: s.planDisplayName || "",
    startDate: s.startDate || "",
    endDate: s.endDate || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);

  const persistProfile = useCallback((p: Profile | null) => {
    if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    else localStorage.removeItem(PROFILE_KEY);
  }, []);

  const refreshSubscription = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsSubscribed(false);
      setSubscriptionInfo(null);
      return;
    }
    try {
      const data = await getSubscriptionStatus();
      setIsSubscribed(data?.isSubscribed ?? false);
      setSubscriptionInfo(subscriptionInfoFromStatus(data ?? null));
    } catch {
      setIsSubscribed(false);
      setSubscriptionInfo(null);
    }
  }, []);

  const loadProfile = useCallback(
    async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, is_admin")
        .eq("id", authUser.id)
        .maybeSingle();
      const p = profileFromUser(authUser, profileRow);
      setUser(p);
      setProfile(p);
      persistProfile(p);
      await refreshSubscription();
    },
    [persistProfile, refreshSubscription]
  );

  useEffect(() => {
    // #region agent log
    const log = (msg: string, data: Record<string, unknown>) => { try { fetch('http://127.0.0.1:7244/ingest/a06809ba-2f2d-4027-ad1b-0c709d05e1cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:getSession',message:msg,data,timestamp:Date.now(),hypothesisId:'H2'})}); } catch (_) {} };
    // #endregion
    function restoreFromStorage() {
      try {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
          const p = JSON.parse(stored) as Profile | null;
          if (p && p.id && p.email) {
            setUser(p);
            setProfile(p);
            const t = localStorage.getItem(TOKEN_KEY);
            if (t) setToken(t);
            return true;
          }
        }
      } catch {
        // ignore
      }
      return false;
    }
    if (restoreFromStorage()) setLoading(false);
    const timeoutId = window.setTimeout(() => {
      restoreFromStorage();
      setLoading(false);
    }, 3000);
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeoutId);
        // #region agent log
        log('getSession resolved', { hasSession: !!session, hasUser: !!session?.user });
        // #endregion
        if (session?.user) {
          setToken(session.access_token);
          loadProfile(session.user);
        } else {
          setToken(null);
          setUser(null);
          setProfile(null);
          setIsSubscribed(false);
          setSubscriptionInfo(null);
          persistProfile(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        // #region agent log
        log('getSession rejected', { error: String(err?.message ?? err), name: err?.name });
        // #endregion
        setLoading(false);
      });
    return () => clearTimeout(timeoutId);
  }, [loadProfile, persistProfile]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setToken(session.access_token);
        await loadProfile(session.user);
      } else {
        setToken(null);
        setUser(null);
        setProfile(null);
        setIsSubscribed(false);
        setSubscriptionInfo(null);
        persistProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile, persistProfile]);

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      setProfile(null);
      setIsSubscribed(false);
      setSubscriptionInfo(null);
      persistProfile(null);
    };
    window.addEventListener("auth:session-expired", onSessionExpired);
    return () => window.removeEventListener("auth:session-expired", onSessionExpired);
  }, [persistProfile]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<{ error: { message: string } | null }> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim() || "User" } },
      });
      if (error) {
        return { error: { message: error.message } };
      }
      if (data.session) {
        setToken(data.session.access_token);
        await loadProfile(data.user);
      } else if (data.user) {
        await loadProfile(data.user);
      }
      return { error: null };
    },
    [loadProfile]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: { message: string } | null }> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        return { error: { message: error.message } };
      }
      if (data.session) {
        setToken(data.session.access_token);
        await loadProfile(data.user);
      }
      return { error: null };
    },
    [loadProfile]
  );

  const signInWithGoogle = useCallback(
    async (idToken: string): Promise<{ error: { message: string } | null }> => {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) {
        return { error: { message: error.message } };
      }
      if (data.session) {
        setToken(data.session.access_token);
        await loadProfile(data.user);
      }
      return { error: null };
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    setProfile(null);
    setIsSubscribed(false);
    setSubscriptionInfo(null);
    persistProfile(null);
  }, [persistProfile]);

  const updateProfile = useCallback(
    (updates: Partial<Profile>) => {
      if (!profile) return;
      const next = { ...profile, ...updates };
      setProfile(next);
      setUser(next);
      persistProfile(next);
    },
    [profile, persistProfile]
  );

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    isSubscribed,
    subscriptionInfo,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
