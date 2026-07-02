"use client";

import { Suspense, type ReactNode } from "react";
import { WelcomeSampleOfferProvider } from "@/components/espace/WelcomeSampleOfferProvider";
import { TicketBalanceNotificationSync } from "@/components/tickets/TicketBalanceNotificationSync";
import { TicketBalanceUrlSync } from "@/components/tickets/TicketBalanceUrlSync";

type WelcomeSampleOfferRootProps = {
  children: ReactNode;
};

function WelcomeSampleOfferProviderFallback({ children }: WelcomeSampleOfferRootProps) {
  return <>{children}</>;
}

export function WelcomeSampleOfferRoot({ children }: WelcomeSampleOfferRootProps) {
  return (
    <Suspense fallback={<WelcomeSampleOfferProviderFallback>{children}</WelcomeSampleOfferProviderFallback>}>
      <WelcomeSampleOfferProvider>
        <TicketBalanceUrlSync />
        <TicketBalanceNotificationSync />
        {children}
      </WelcomeSampleOfferProvider>
    </Suspense>
  );
}
