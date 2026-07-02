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
  refreshTicketBalance: () => Promise<void>;
  setTicketBalance: (balance: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser: SessionUser | null;
  initialIsAdmin?: boolean;
};

export function AuthProvider({
  children,
  initialUser,
  initialIsAdmin = false,
}: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null | undefined>(initialUser);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoaded, setBalanceLoaded] = useState(!initialUser);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  const refreshTicketBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/tickets/balance");
      if (!response.ok) {
        setBalanceLoaded(true);
        return;
      }
      const data = (await response.json()) as { balance?: number };
      setBalance(typeof data.balance === "number" ? data.balance : 0);
      setBalanceLoaded(true);
    } catch {
      setBalanceLoaded(true);
    }
  }, []);

  const setTicketBalanceValue = useCallback((nextBalance: number) => {
    setBalance(nextBalance);
    setBalanceLoaded(true);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = (await response.json()) as {
        user: SessionUser | null;
        isAdmin?: boolean;
      };
      setUser(data.user);
      if (!data.user) {
        setBalance(null);
        setIsAdmin(false);
        setBalanceLoaded(true);
        return;
      }
      setIsAdmin(Boolean(data.isAdmin));
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
    }
  }, [initialUser, initialIsAdmin]);

  useEffect(() => {
    if (!initialUser || initialIsAdmin) {
      return;
    }

    void refreshTicketBalance();
  }, [initialUser?.email, initialIsAdmin, refreshTicketBalance]);

  const value = useMemo(
    () => ({
      user,
      balance,
      balanceLoaded,
      isAdmin,
      refresh,
      refreshTicketBalance,
      setTicketBalance: setTicketBalanceValue,
    }),
    [
      user,
      balance,
      balanceLoaded,
      isAdmin,
      refresh,
      refreshTicketBalance,
      setTicketBalanceValue,
    ]
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
  const {
    user,
    balance,
    balanceLoaded,
    refreshTicketBalance,
    setTicketBalance,
  } = useAuthContext();

  return {
    balance: user ? balance : null,
    refresh: refreshTicketBalance,
    setTicketBalance,
    isLoading: Boolean(user) && !balanceLoaded,
  };
}
