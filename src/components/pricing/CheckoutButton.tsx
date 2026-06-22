"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WithdrawalWaiverField } from "@/components/pricing/WithdrawalWaiverField";
import { useLocale } from "@/components/LocaleProvider";
import { useAuthUser } from "@/hooks/use-auth-user";
import { requestCheckoutSession } from "@/lib/stripe/start-checkout-client";
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
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const waiverId = `withdrawal-waiver-${planType}-${planId}`;

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

    if (!waiverAccepted) {
      setError(t("checkout.withdrawalWaiverRequired"));
      return;
    }

    setPending(true);
    setError(null);

    const result = await requestCheckoutSession({
      planId,
      planType,
      withdrawalWaiverAccepted: true,
    });

    if (!result.ok) {
      setError(
        result.error === "checkout.error"
          ? t("checkout.error")
          : result.error
      );
      setPending(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <div className="w-full space-y-3">
      {user ? (
        <WithdrawalWaiverField
          id={waiverId}
          checked={waiverAccepted}
          onChange={(checked) => {
            setWaiverAccepted(checked);
            if (checked) setError(null);
          }}
        />
      ) : null}
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={pending || (Boolean(user) && !waiverAccepted)}
        onClick={() => void handleCheckout()}
      >
        {pending ? t("checkout.loading") : children}
      </Button>
      {error && (
        <p className="text-center text-xs text-red-300/90" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
