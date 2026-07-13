"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { CancelSubscriptionModal } from "@/components/espace/CancelSubscriptionModal";
import { requestScheduleCancellation } from "@/lib/stripe/schedule-cancellation-client";

type ManageSubscriptionButtonProps = {
  className?: string;
  disabled?: boolean;
  cancellationPreviewDate?: string | null;
  cancellationPreviewMode?: "commitment" | "period_end";
  onScheduled?: () => void;
};

export function ManageSubscriptionButton({
  className = "",
  disabled = false,
  cancellationPreviewDate = null,
  cancellationPreviewMode = "period_end",
  onScheduled,
}: ManageSubscriptionButtonProps) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (disabled) setSuccess(null);
  }, [disabled]);

  function handleOpenModal() {
    if (!cancellationPreviewDate) {
      setError(t("space.cancelSubscriptionDateUnavailable"));
      return;
    }
    setError(null);
    setModalOpen(true);
  }

  async function handleConfirmCancellation() {
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
    setModalOpen(false);
    onScheduled?.();
  }

  return (
    <>
      <div className="subscription-profile-block__actions w-full sm:w-auto">
        <Button
          type="button"
          variant="secondary"
          className={className}
          disabled={pending || disabled || !cancellationPreviewDate}
          onClick={handleOpenModal}
        >
          {pending ? t("space.cancelling") : t("space.cancelSubscription")}
        </Button>
        {error ? (
          <p
            className="subscription-profile-block__feedback subscription-profile-block__feedback--error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {success ? (
          <p
            className="subscription-profile-block__feedback subscription-profile-block__feedback--success"
            role="status"
          >
            {success}
          </p>
        ) : null}
      </div>

      <CancelSubscriptionModal
        open={modalOpen}
        effectiveDate={cancellationPreviewDate}
        mode={cancellationPreviewMode}
        pending={pending}
        onConfirm={() => void handleConfirmCancellation()}
        onClose={() => {
          if (!pending) setModalOpen(false);
        }}
      />
    </>
  );
}
