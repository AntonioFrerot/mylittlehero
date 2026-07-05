"use client";

import { GoldenJeton } from "@/components/tickets/GoldenJeton";
import { useJetonBalance } from "@/hooks/use-jeton-balance";

type HeaderJetonCountProps = {
  className?: string;
};

export function HeaderJetonCount({ className = "" }: HeaderJetonCountProps) {
  const { balance, isLoading } = useJetonBalance();

  if (isLoading) {
    return <span className={`gold-jeton-skeleton ${className}`} aria-hidden />;
  }

  if (balance === null || balance < 1) return null;

  return (
    <div className={className} aria-label={`${balance} jetons`}>
      <GoldenJeton count={balance} size="header" />
    </div>
  );
}
