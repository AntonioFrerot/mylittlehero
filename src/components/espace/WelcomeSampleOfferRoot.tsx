"use client";

import { Suspense, type ReactNode } from "react";
import { WelcomeSampleOfferProvider } from "@/components/espace/WelcomeSampleOfferProvider";

type WelcomeSampleOfferRootProps = {
  children: ReactNode;
};

function WelcomeSampleOfferProviderFallback({ children }: WelcomeSampleOfferRootProps) {
  return <>{children}</>;
}

export function WelcomeSampleOfferRoot({ children }: WelcomeSampleOfferRootProps) {
  return (
    <Suspense fallback={<WelcomeSampleOfferProviderFallback>{children}</WelcomeSampleOfferProviderFallback>}>
      <WelcomeSampleOfferProvider>{children}</WelcomeSampleOfferProvider>
    </Suspense>
  );
}
