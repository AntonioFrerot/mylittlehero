"use client";

import { useEffect, useRef } from "react";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { CheckoutPlanId, CheckoutPlanType } from "@/lib/stripe/plans";

type CheckoutLauncherProps = {
  planType: CheckoutPlanType;
};

function isCheckoutPlanId(
  planType: CheckoutPlanType,
  value: string
): value is CheckoutPlanId {
  if (planType === "purchase") {
    return ["film-5min", "film-10min", "pack-3films"].includes(value);
  }
  return [
    "standard-monthly",
    "standard-yearly",
    "unlimited-monthly",
    "unlimited-yearly",
  ].includes(value);
}

export function CheckoutLauncher({ planType }: CheckoutLauncherProps) {
  const user = useAuthUser();
  const launched = useRef(false);

  useEffect(() => {
    if (!user || launched.current) return;

    const params = new URLSearchParams(window.location.search);
    const planId = params.get("checkout");
    if (!planId || !isCheckoutPlanId(planType, planId)) return;

    launched.current = true;
    params.delete("checkout");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
    window.history.replaceState({}, "", nextUrl);

    void (async () => {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, planType }),
      });
      const data = (await response.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    })();
  }, [user, planType]);

  return null;
}
