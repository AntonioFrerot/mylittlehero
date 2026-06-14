"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/lib/auth/session";

type AuthContextValue = {
  user: SessionUser | null | undefined;
  balance: number | null;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser: SessionUser | null;
  initialBalance: number | null;
};

export function AuthProvider({
  children,
  initialUser,
  initialBalance,
}: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null | undefined>(initialUser);
  const [balance, setBalance] = useState<number | null>(() =>
    initialUser ? initialBalance : null
  );

  useEffect(() => {
    setUser(initialUser);
    setBalance(initialUser ? initialBalance : null);
  }, [initialUser, initialBalance]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = (await response.json()) as {
        user: SessionUser | null;
        balance?: number;
      };
      setUser(data.user);
      if (!data.user) {
        setBalance(null);
        return;
      }
      setBalance(typeof data.balance === "number" ? data.balance : 0);
    } catch {
      setUser(null);
      setBalance(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, balance, refresh }),
    [user, balance, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Auth hooks must be used within AuthProvider");
  }
  return context;
}

export function useAuthUser() {
  return useAuthContext().user;
}

export function useTicketBalance() {
  const { user, balance, refresh } = useAuthContext();
  return {
    balance: user ? balance : null,
    refresh,
    isLoading: user === undefined,
  };
}
