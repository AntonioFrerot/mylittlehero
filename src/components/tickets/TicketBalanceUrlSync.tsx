"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTicketBalance } from "@/hooks/use-ticket-balance";

export function TicketBalanceUrlSync() {
  const searchParams = useSearchParams();
  const { setTicketBalance } = useTicketBalance();

  useEffect(() => {
    const raw = searchParams.get("ticketBalance");
    if (raw === null) return;

    const nextBalance = Number(raw);
    if (!Number.isFinite(nextBalance)) return;

    setTicketBalance(nextBalance);

    const url = new URL(window.location.href);
    url.searchParams.delete("ticketBalance");
    window.history.replaceState({}, "", url);
  }, [searchParams, setTicketBalance]);

  return null;
}
