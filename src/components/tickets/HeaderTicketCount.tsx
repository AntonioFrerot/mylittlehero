"use client";

import { GoldenTicket } from "@/components/tickets/GoldenTicket";
import { useTicketBalance } from "@/hooks/use-ticket-balance";

type HeaderTicketCountProps = {
  className?: string;
};

export function HeaderTicketCount({ className = "" }: HeaderTicketCountProps) {
  const { balance, isLoading } = useTicketBalance();

  if (isLoading) {
    return (
      <span
        className={`gold-ticket-skeleton ${className}`}
        aria-hidden
      />
    );
  }

  if (balance === null) return null;

  return (
    <div className={className} aria-label={`${balance} tickets`}>
      <GoldenTicket count={balance} size="header" />
    </div>
  );
}
