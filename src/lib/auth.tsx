"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "business_owner" | "admin" | "superadmin";
  avatar?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, phone?: string) => Promise<void>;
  register: (name: string, email: string, password: string, locations?: { country: string; city: string }[], phone?: string) => Promise<{ pending: boolean; pending_id: number; message: string; email_sent: boolean }>;
  applyAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((t: string) => {
    localStorage.setItem("biruni_token", t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("biruni_token");
    setToken(null);
    setUser(null);
  }, []);

  // Fetch user from server using stored token
  const fetchMe = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${API}/auth.php`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) { logout(); return; }
      const u = await res.json();
      if (u) setUser(u);
      else logout();
    } catch {
      logout();
    }
  }, [logout]);

  // On mount: check localStorage or exchange OAuth cookie (Google callback)
  useEffect(() => {
    (async () => {
      // Google OAuth callback — exchange HttpOnly cookie for token via API
      if (window.location.pathname === "/auth/callback") {
        try {
          const res = await fetch(`${API}/auth_google_token.php`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (data.token && data.user) {
              applyToken(data.token);
              setUser(data.user);
              window.history.replaceState({}, "", "/");
              setLoading(false);
              return;
            }
          }
        } catch { /* fall through to stored token */ }
      }

      const stored = localStorage.getItem("biruni_token");
      if (stored) {
        setToken(stored);
        await fetchMe(stored);
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string, phone?: string) => {
    const res = await fetch(`${API}/auth.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email: email || undefined, phone: phone || undefined, password }),
    });
    const data = await res.json();
    if (res.status === 403 && data.needs_verification) {
      // Throw a special error that includes user_id so the signin page can redirect to verify
      const err = new Error(data.error || "Please verify your email");
      (err as Error & { user_id?: number }).user_id = data.user_id;
      throw err;
    }
    if (!res.ok) throw new Error(data.error || "Login failed");
    applyToken(data.token);
    setUser(data.user);
  };

  const applyAuth = useCallback((token: string, userData: AuthUser) => {
    applyToken(token);
    setUser(userData);
  }, [applyToken]);

  const register = async (name: string, email: string, password: string, locations?: { country: string; city: string }[], phone?: string) => {
    const res = await fetch(`${API}/auth.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", name, email: email || undefined, phone: phone || undefined, password, locations: locations ?? [] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    // Registration now returns {pending: true, user_id} — caller handles OTP step
    return data as { pending: boolean; pending_id: number; message: string; email_sent: boolean };
  };

  return (
    <Ctx.Provider value={{
      user, token, loading, login, register, logout, applyAuth,
      isAdmin: user?.role === "admin" || user?.role === "superadmin",
      isSuperAdmin: user?.role === "superadmin",
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
