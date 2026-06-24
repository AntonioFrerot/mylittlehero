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
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser: SessionUser | null;
  initialBalance: number | null;
  initialIsAdmin?: boolean;
};

export function AuthProvider({
  children,
  initialUser,
  initialBalance,
  initialIsAdmin = false,
}: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null | undefined>(initialUser);
  const [balance, setBalance] = useState<number | null>(() =>
    initialUser ? initialBalance : null
  );
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    setUser(initialUser);
    setBalance(initialUser ? initialBalance : null);
    setIsAdmin(initialIsAdmin);
  }, [initialUser, initialBalance, initialIsAdmin]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = (await response.json()) as {
        user: SessionUser | null;
        balance?: number;
        isAdmin?: boolean;
      };
      setUser(data.user);
      if (!data.user) {
        setBalance(null);
        setIsAdmin(false);
        return;
      }
      setBalance(typeof data.balance === "number" ? data.balance : 0);
      setIsAdmin(Boolean(data.isAdmin));
    } catch {
      setUser(null);
      setBalance(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, balance, isAdmin, refresh }),
    [user, balance, isAdmin, refresh]
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

export function useIsAdmin() {
  return useAuthContext().isAdmin;
}

export function useTicketBalance() {
  const { user, balance, refresh } = useAuthContext();
  return {
    balance: user ? balance : null,
    refresh,
    isLoading: user === undefined,
  };
}
