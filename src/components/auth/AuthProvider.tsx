"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/lib/auth/session";
import {
  clearCachedTicketBalance,
  writeCachedTicketBalance,
} from "@/lib/tickets/client-balance-cache";

type AuthContextValue = {
  user: SessionUser | null | undefined;
  balance: number | null;
  balanceLoaded: boolean;
  jetonBalance: number | null;
  jetonBalanceLoaded: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  refreshTicketBalance: () => Promise<void>;
  refreshJetonBalance: () => Promise<void>;
  setTicketBalance: (balance: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser: SessionUser | null;
  initialIsAdmin?: boolean;
  initialBalance?: number | null;
  initialJetonBalance?: number | null;
};

function readInitialBalance(
  initialUser: SessionUser | null,
  initialBalance: number | null | undefined
): number | null {
  if (!initialUser) return null;
  return typeof initialBalance === "number" ? initialBalance : null;
}

function readInitialBalanceLoaded(
  initialUser: SessionUser | null,
  initialBalance: number | null | undefined
): boolean {
  if (!initialUser) return true;
  return typeof initialBalance === "number";
}

function readInitialJetonBalance(
  initialUser: SessionUser | null,
  initialJetonBalance: number | null | undefined
): number | null {
  if (!initialUser) return null;
  return typeof initialJetonBalance === "number" ? initialJetonBalance : null;
}

function readInitialJetonBalanceLoaded(
  initialUser: SessionUser | null,
  initialJetonBalance: number | null | undefined
): boolean {
  if (!initialUser) return true;
  return typeof initialJetonBalance === "number";
}

export function AuthProvider({
  children,
  initialUser,
  initialIsAdmin = false,
  initialBalance = null,
  initialJetonBalance = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null | undefined>(initialUser);
  const [balance, setBalance] = useState<number | null>(() =>
    readInitialBalance(initialUser, initialBalance)
  );
  const [balanceLoaded, setBalanceLoaded] = useState(() =>
    readInitialBalanceLoaded(initialUser, initialBalance)
  );
  const [jetonBalance, setJetonBalance] = useState<number | null>(() =>
    readInitialJetonBalance(initialUser, initialJetonBalance)
  );
  const [jetonBalanceLoaded, setJetonBalanceLoaded] = useState(() =>
    readInitialJetonBalanceLoaded(initialUser, initialJetonBalance)
  );
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const userEmailRef = useRef<string | null>(initialUser?.email ?? null);

  const persistTicketBalance = useCallback((nextBalance: number) => {
    const email = userEmailRef.current;
    if (email) {
      writeCachedTicketBalance(email, nextBalance);
    }
  }, []);

  const setTicketBalanceValue = useCallback(
    (nextBalance: number) => {
      setBalance(nextBalance);
      setBalanceLoaded(true);
      persistTicketBalance(nextBalance);
    },
    [persistTicketBalance]
  );

  const refreshTicketBalance = useCallback(async () => {
    const email = userEmailRef.current;
    if (!email) return;

    try {
      const response = await fetch("/api/tickets/balance");
      if (!response.ok) {
        setBalance((current) => current ?? 0);
        setBalanceLoaded(true);
        return;
      }

      const data = (await response.json()) as { balance?: number };
      const nextBalance = typeof data.balance === "number" ? data.balance : 0;
      setBalance(nextBalance);
      setBalanceLoaded(true);
      writeCachedTicketBalance(email, nextBalance);
    } catch {
      setBalance((current) => current ?? 0);
      setBalanceLoaded(true);
    }
  }, []);

  const refreshJetonBalance = useCallback(async () => {
    const email = userEmailRef.current;
    if (!email) return;

    try {
      const response = await fetch("/api/jetons/balance");
      if (!response.ok) {
        setJetonBalance((current) => current ?? 0);
        setJetonBalanceLoaded(true);
        return;
      }

      const data = (await response.json()) as { balance?: number };
      const nextBalance = typeof data.balance === "number" ? data.balance : 0;
      setJetonBalance(nextBalance);
      setJetonBalanceLoaded(true);
    } catch {
      setJetonBalance((current) => current ?? 0);
      setJetonBalanceLoaded(true);
    }
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
        const previousEmail = userEmailRef.current;
        if (previousEmail) {
          clearCachedTicketBalance(previousEmail);
        }
        userEmailRef.current = null;
        setBalance(null);
        setJetonBalance(null);
        setIsAdmin(false);
        setBalanceLoaded(true);
        setJetonBalanceLoaded(true);
        return;
      }
      setIsAdmin(Boolean(data.isAdmin));
    } catch {
      const previousEmail = userEmailRef.current;
      if (previousEmail) {
        clearCachedTicketBalance(previousEmail);
      }
      userEmailRef.current = null;
      setUser(null);
      setBalance(null);
      setJetonBalance(null);
      setBalanceLoaded(true);
      setJetonBalanceLoaded(true);
    }
  }, []);

  useEffect(() => {
    setUser(initialUser);
    setIsAdmin(initialIsAdmin);
    userEmailRef.current = initialUser?.email ?? null;

    if (!initialUser) {
      setBalance(null);
      setJetonBalance(null);
      setBalanceLoaded(true);
      setJetonBalanceLoaded(true);
    }
  }, [initialUser, initialIsAdmin]);

  useEffect(() => {
    if (!initialUser?.email || balanceLoaded) {
      return;
    }

    void refreshTicketBalance();
  }, [initialUser?.email, balanceLoaded, refreshTicketBalance]);

  useEffect(() => {
    if (!initialUser?.email || jetonBalanceLoaded) {
      return;
    }

    void refreshJetonBalance();
  }, [initialUser?.email, jetonBalanceLoaded, refreshJetonBalance]);

  useEffect(() => {
    if (!initialUser?.email) return;
    if (typeof initialBalance !== "number") return;
    writeCachedTicketBalance(initialUser.email, initialBalance);
  }, [initialUser?.email, initialBalance]);

  const value = useMemo(
    () => ({
      user,
      balance,
      balanceLoaded,
      jetonBalance,
      jetonBalanceLoaded,
      isAdmin,
      refresh,
      refreshTicketBalance,
      refreshJetonBalance,
      setTicketBalance: setTicketBalanceValue,
    }),
    [
      user,
      balance,
      balanceLoaded,
      jetonBalance,
      jetonBalanceLoaded,
      isAdmin,
      refresh,
      refreshTicketBalance,
      refreshJetonBalance,
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

export function useJetonBalance() {
  const { user, jetonBalance, jetonBalanceLoaded, refreshJetonBalance } =
    useAuthContext();

  return {
    balance: user ? jetonBalance : null,
    refresh: refreshJetonBalance,
    isLoading: Boolean(user) && !jetonBalanceLoaded,
  };
}
