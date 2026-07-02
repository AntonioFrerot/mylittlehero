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
  balanceLoaded: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser: SessionUser | null;
  initialIsAdmin?: boolean;
  initialBalance?: number | null;
};

export function AuthProvider({
  children,
  initialUser,
  initialIsAdmin = false,
  initialBalance = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null | undefined>(initialUser);
  const [balance, setBalance] = useState<number | null>(
    initialUser ? initialBalance : null
  );
  const [balanceLoaded, setBalanceLoaded] = useState(!initialUser);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

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
        setBalanceLoaded(true);
        return;
      }
      setBalance(typeof data.balance === "number" ? data.balance : 0);
      setIsAdmin(Boolean(data.isAdmin));
      setBalanceLoaded(true);
    } catch {
      setUser(null);
      setBalance(null);
      setBalanceLoaded(true);
    }
  }, []);

  useEffect(() => {
    setUser(initialUser);
    setIsAdmin(initialIsAdmin);
    if (!initialUser) {
      setBalance(null);
      setBalanceLoaded(true);
      return;
    }

    setBalance(initialBalance);
    setBalanceLoaded(true);
  }, [initialUser, initialIsAdmin, initialBalance]);

  const value = useMemo(
    () => ({ user, balance, balanceLoaded, isAdmin, refresh }),
    [user, balance, balanceLoaded, isAdmin, refresh]
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
  const { user, balance, balanceLoaded, refresh } = useAuthContext();

  return {
    balance: user ? balance : null,
    refresh,
    isLoading: Boolean(user) && !balanceLoaded,
  };
}
