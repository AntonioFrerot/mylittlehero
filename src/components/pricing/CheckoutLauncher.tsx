"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { WithdrawalWaiverField } from "@/components/pricing/WithdrawalWaiverField";
import { useLocale } from "@/components/LocaleProvider";
import { useAuthUser } from "@/hooks/use-auth-user";
import { requestCheckoutSession } from "@/lib/stripe/start-checkout-client";
import type { CheckoutPlanId, CheckoutPlanType } from "@/lib/stripe/plans";
import { SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";

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

function clearCheckoutQueryParam() {
  const params = new URLSearchParams(window.location.search);
  params.delete("checkout");
  const nextQuery = params.toString();
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`
  );
}

export function CheckoutLauncher({ planType }: CheckoutLauncherProps) {
  const { t } = useLocale();
  const user = useAuthUser();
  const waiverId = useId();
  const [planId, setPlanId] = useState<CheckoutPlanId | null>(null);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const checkoutPlanId = params.get("checkout");
    if (!checkoutPlanId || !isCheckoutPlanId(planType, checkoutPlanId)) return;

    setPlanId(checkoutPlanId);
    setWaiverAccepted(false);
    setError(null);
  }, [user, planType]);

  if (!user || !planId) return null;

  async function handleResumeCheckout() {
    if (!planId || !waiverAccepted) {
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

    clearCheckoutQueryParam();
    window.location.href = result.url;
  }

  function handleDismiss() {
    clearCheckoutQueryParam();
    setPlanId(null);
    setWaiverAccepted(false);
    setError(null);
  }

  return (
    <div
      className={`mx-auto mb-8 max-w-3xl px-4 md:px-8 ${SURFACE_3D_PANEL_LG} border-gold/25 p-5 md:p-6`}
      role="region"
      aria-label={t("checkout.resumeTitle")}
    >
      <p className="text-sm font-medium text-gold-light">{t("checkout.resumeTitle")}</p>
      <p className="mt-2 text-sm text-cream/65">{t("checkout.resumeHint")}</p>

      <div className="mt-4">
        <WithdrawalWaiverField
          id={waiverId}
          checked={waiverAccepted}
          onChange={(checked) => {
            setWaiverAccepted(checked);
            if (checked) setError(null);
          }}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="primary"
          className="w-full sm:flex-1"
          disabled={pending || !waiverAccepted}
          onClick={() => void handleResumeCheckout()}
        >
          {pending ? t("checkout.loading") : t("checkout.resumePay")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={pending}
          onClick={handleDismiss}
        >
          {t("checkout.resumeDismiss")}
        </Button>
      </div>

      {error ? (
        <p className="mt-3 text-center text-xs text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
