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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, locations?: { country: string; city: string }[]) => Promise<void>;
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

  // On mount: check localStorage and URL (Google callback)
  useEffect(() => {
    (async () => {
      // Google OAuth callback — token in URL
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        applyToken(urlToken);
        await fetchMe(urlToken);
        // Clean URL
        const clean = window.location.pathname;
        window.history.replaceState({}, "", clean);
        setLoading(false);
        return;
      }

      const stored = localStorage.getItem("biruni_token");
      if (stored) {
        setToken(stored);
        await fetchMe(stored);
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    applyToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, locations?: { country: string; city: string }[]) => {
    const res = await fetch(`${API}/auth.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", name, email, password, locations: locations ?? [] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    applyToken(data.token);
    setUser(data.user);
  };

  return (
    <Ctx.Provider value={{
      user, token, loading, login, register, logout,
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
