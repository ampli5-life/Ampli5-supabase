import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getToken,
  setToken,
  login as apiLogin,
  register as apiRegister,
  loginWithGoogle as apiLoginWithGoogle,
  getSubscriptionStatus,
  type ApiUser,
  type SubscriptionStatus,
} from "@/lib/api";

const PROFILE_KEY = "ampli5_profile";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

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

function profileFromApiUser(apiUser: ApiUser): Profile {
  return {
    id: apiUser.id,
    email: apiUser.email,
    full_name: apiUser.fullName,
    avatar_url: null,
    is_admin: apiUser.isAdmin ?? false,
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

  const persistProfile = useCallback((p: Profile | null) => {
    if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    else localStorage.removeItem(PROFILE_KEY);
  }, []);

  useEffect(() => {
    const token = getToken();
    const saved = localStorage.getItem(PROFILE_KEY);
    if (token && saved && !isTokenExpired(token)) {
      try {
        const data = JSON.parse(saved) as Profile;
        setUser(data);
        setProfile(data);
        getSubscriptionStatus()
          .then((s) => {
            setIsSubscribed(s?.isSubscribed ?? false);
            setSubscriptionInfo(subscriptionInfoFromStatus(s ?? null));
          })
          .catch(() => {
            setIsSubscribed(false);
            setSubscriptionInfo(null);
          });
      } catch {
        setToken(null);
        localStorage.removeItem(PROFILE_KEY);
        setIsSubscribed(false);
        setSubscriptionInfo(null);
      }
    } else {
      setToken(null);
      localStorage.removeItem(PROFILE_KEY);
      setUser(null);
      setProfile(null);
      setIsSubscribed(false);
      setSubscriptionInfo(null);
    }
    setLoading(false);
  }, []);

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
      const result = await apiRegister(email, password, fullName);
      if ("error" in result) {
        return { error: { message: result.error } };
      }
      const { token, user: apiUser } = result;
      setToken(token);
      const profileData = profileFromApiUser(apiUser);
      setUser(profileData);
      setProfile(profileData);
      persistProfile(profileData);
      await refreshSubscription();
      return { error: null };
    },
    [persistProfile, refreshSubscription]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: { message: string } | null }> => {
      const result = await apiLogin(email, password);
      if ("error" in result) {
        return { error: { message: result.error } };
      }
      const { token, user: apiUser } = result;
      setToken(token);
      const profileData = profileFromApiUser(apiUser);
      setUser(profileData);
      setProfile(profileData);
      persistProfile(profileData);
      await refreshSubscription();
      return { error: null };
    },
    [persistProfile, refreshSubscription]
  );

  const signInWithGoogle = useCallback(
    async (idToken: string): Promise<{ error: { message: string } | null }> => {
      const result = await apiLoginWithGoogle(idToken);
      if ("error" in result) {
        return { error: { message: result.error } };
      }
      const { token, user: apiUser } = result;
      setToken(token);
      const profileData = profileFromApiUser(apiUser);
      setUser(profileData);
      setProfile(profileData);
      persistProfile(profileData);
      await refreshSubscription();
      return { error: null };
    },
    [persistProfile, refreshSubscription]
  );

  const signOut = useCallback(() => {
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
