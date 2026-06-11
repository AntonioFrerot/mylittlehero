"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { CheckoutPlanId, CheckoutPlanType } from "@/lib/stripe/plans";

type CheckoutButtonProps = {
  planId: CheckoutPlanId;
  planType: CheckoutPlanType;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

function getLoginRedirect(planType: CheckoutPlanType, planId: CheckoutPlanId): string {
  const base = planType === "purchase" ? "/achat" : "/creer";
  return `${base}?checkout=${encodeURIComponent(planId)}`;
}

export function CheckoutButton({
  planId,
  planType,
  variant = "primary",
  className = "",
  children,
}: CheckoutButtonProps) {
  const { t } = useLocale();
  const user = useAuthUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user === undefined) {
    return (
      <span
        className={`${className} inline-flex min-h-[44px] animate-pulse items-center justify-center rounded-2xl bg-white/10`}
        aria-hidden
      />
    );
  }

  async function handleCheckout() {
    if (!user) {
      const redirect = getLoginRedirect(planType, planId);
      window.location.href = `/connexion?mode=signup&redirect=${encodeURIComponent(redirect)}`;
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, planType }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? t("checkout.error"));
        setPending(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t("checkout.error"));
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={pending}
        onClick={() => void handleCheckout()}
      >
        {pending ? t("checkout.loading") : children}
      </Button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-300/90" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
