"use client";

import { useEffect } from "react";
import { useTicketBalance } from "@/hooks/use-ticket-balance";

export function RefreshTicketBalanceOnPurchase() {
  const { refresh } = useTicketBalance();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return null;
}
