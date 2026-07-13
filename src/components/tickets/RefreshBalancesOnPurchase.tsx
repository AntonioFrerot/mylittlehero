"use client";

import { useEffect } from "react";
import { useJetonBalance } from "@/hooks/use-jeton-balance";
import { useTicketBalance } from "@/hooks/use-ticket-balance";

export function RefreshBalancesOnPurchase() {
  const { refresh: refreshTickets } = useTicketBalance();
  const { refresh: refreshJetons } = useJetonBalance();

  useEffect(() => {
    void refreshTickets();
    void refreshJetons();
  }, [refreshTickets, refreshJetons]);

  return null;
}
