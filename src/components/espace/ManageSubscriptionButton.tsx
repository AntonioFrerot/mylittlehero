"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { requestBillingPortalSession } from "@/lib/stripe/start-portal-client";

type ManageSubscriptionButtonProps = {
  className?: string;
};

export function ManageSubscriptionButton({
  className = "",
}: ManageSubscriptionButtonProps) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpenPortal() {
    setPending(true);
    setError(null);

    const result = await requestBillingPortalSession();

    if (!result.ok) {
      setError(
        result.error === "checkout.error" ? t("checkout.error") : result.error
      );
      setPending(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <div className="w-full sm:w-auto">
      <Button
        type="button"
        variant="secondary"
        className={className}
        disabled={pending}
        onClick={() => void handleOpenPortal()}
      >
        {pending ? t("space.cancelling") : t("space.cancelSubscription")}
      </Button>
      {error ? (
        <p className="mt-2 text-center text-xs text-red-300/90 sm:text-right" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
