"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

type AuthContextType = AuthState & {
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // On mount, check if we have a stored access token and validate it
  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      // Try to get a fresh access token using the refresh cookie
      const res = await fetch(`${APP_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // send httpOnly cookie
      });

      if (res.ok) {
        const data = await res.json();
        // Persist access token for API calls
        try { localStorage.setItem("sermon_ai_access_token", data.accessToken); }
        catch {}
        setState({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // No valid refresh token — clear state
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(`${APP_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Registration failed (${res.status})`);
      }

      // Persist access token for API calls
      try { localStorage.setItem("sermon_ai_access_token", data.accessToken); }
      catch {}
      setState({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(`${APP_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Login failed (${res.status})`);
      }

      // Persist access token for API calls
      try { localStorage.setItem("sermon_ai_access_token", data.accessToken); }
      catch {}
      setState({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${APP_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors — still clear local state
    } finally {
      // Clear persisted access token
      try { localStorage.removeItem("sermon_ai_access_token"); }
      catch {}
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    register,
    login,
    logout,
    refreshSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
