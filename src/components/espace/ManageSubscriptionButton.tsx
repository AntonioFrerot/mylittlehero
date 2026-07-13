"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { requestScheduleCancellation } from "@/lib/stripe/schedule-cancellation-client";
import { isCommitmentSubscriptionPlan } from "@/lib/stripe/subscription-commitment";

type ManageSubscriptionButtonProps = {
  className?: string;
  subscriptionPlanId?: string;
};

export function ManageSubscriptionButton({
  className = "",
  subscriptionPlanId,
}: ManageSubscriptionButtonProps) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleCancel() {
    const isCommitment = isCommitmentSubscriptionPlan(subscriptionPlanId);

    if (isCommitment) {
      const confirmed = window.confirm(t("space.cancelSubscriptionConfirm"));
      if (!confirmed) return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);

    const result = await requestScheduleCancellation();

    if (!result.ok) {
      setError(
        result.error === "checkout.error" ? t("checkout.error") : result.error
      );
      setPending(false);
      return;
    }

    const message =
      result.alreadyScheduled && result.mode === "commitment"
        ? t("space.cancelSubscriptionAlreadyScheduled", {
            date: result.effectiveDate,
          })
        : result.mode === "commitment"
          ? t("space.cancelSubscriptionScheduled", {
              date: result.effectiveDate,
            })
          : t("space.cancelSubscriptionPeriodEnd", {
              date: result.effectiveDate,
            });

    setSuccess(message);
    setPending(false);
  }

  return (
    <div className="w-full sm:w-auto">
      <Button
        type="button"
        variant="secondary"
        className={className}
        disabled={pending}
        onClick={() => void handleCancel()}
      >
        {pending ? t("space.cancelling") : t("space.cancelSubscription")}
      </Button>
      {error ? (
        <p className="mt-2 text-center text-xs text-red-300/90 sm:text-right" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-2 text-center text-xs text-emerald-300/90 sm:text-right" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
