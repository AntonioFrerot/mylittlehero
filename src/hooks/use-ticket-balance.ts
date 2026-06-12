"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/use-auth-user";

export function useTicketBalance() {
  const user = useAuthUser();
  const [balance, setBalance] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setBalance(null);
      return;
    }

    try {
      const response = await fetch("/api/tickets/balance");
      if (!response.ok) {
        setBalance(0);
        return;
      }
      const data = (await response.json()) as { balance?: number };
      setBalance(typeof data.balance === "number" ? data.balance : 0);
    } catch {
      setBalance(0);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { balance, refresh, isLoading: user !== null && balance === null };
}
