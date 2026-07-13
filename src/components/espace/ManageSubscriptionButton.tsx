"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { CancelSubscriptionModal } from "@/components/espace/CancelSubscriptionModal";
import { RevertSubscriptionModal } from "@/components/espace/RevertSubscriptionModal";
import { requestScheduleCancellation } from "@/lib/stripe/schedule-cancellation-client";
import { requestRevertCancellation } from "@/lib/stripe/revert-cancellation-client";

type ManageSubscriptionButtonProps = {
  className?: string;
  cancellationScheduled?: boolean;
  cancellationPreviewDate?: string | null;
  cancellationPreviewMode?: "commitment" | "period_end";
  onScheduled?: () => void;
};

export function ManageSubscriptionButton({
  className = "",
  cancellationScheduled = false,
  cancellationPreviewDate = null,
  cancellationPreviewMode = "period_end",
  onScheduled,
}: ManageSubscriptionButtonProps) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [revertModalOpen, setRevertModalOpen] = useState(false);

  function handleOpenCancelModal() {
    if (!cancellationPreviewDate) {
      setError(t("space.cancelSubscriptionDateUnavailable"));
      return;
    }
    setError(null);
    setSuccess(null);
    setCancelModalOpen(true);
  }
  function handleOpenRevertModal() {
    setError(null);
    setSuccess(null);
    setRevertModalOpen(true);
  }

  async function handleConfirmCancellation() {
    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await requestScheduleCancellation();

      if (!result.ok) {
        setError(
          result.error === "checkout.error" ? t("checkout.error") : result.error
        );
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
      setCancelModalOpen(false);
      onScheduled?.();
    } finally {
      setPending(false);
    }
  }

  async function handleConfirmRevert() {
    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await requestRevertCancellation();

      if (!result.ok) {
        setError(
          result.error === "checkout.error" ? t("checkout.error") : result.error
        );
        return;
      }

      setSuccess(t("space.revertSubscriptionSuccess"));
      setRevertModalOpen(false);
      onScheduled?.();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="subscription-profile-block__actions w-full sm:w-auto">
        {cancellationScheduled ? (
          <Button
            type="button"
            variant="primary"
            className={className}
            disabled={pending}
            onClick={handleOpenRevertModal}
          >
            {pending ? t("space.revertingSubscription") : t("space.keepSubscription")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className={className}
            disabled={pending || !cancellationPreviewDate}
            onClick={handleOpenCancelModal}
          >
            {pending ? t("space.cancelling") : t("space.cancelSubscription")}
          </Button>
        )}
        {error && !cancelModalOpen && !revertModalOpen ? (
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
        open={cancelModalOpen}
        effectiveDate={cancellationPreviewDate}
        mode={cancellationPreviewMode}
        pending={pending}
        error={cancelModalOpen ? error : null}
        onConfirm={() => void handleConfirmCancellation()}
        onClose={() => {
          if (!pending) {
            setCancelModalOpen(false);
            setError(null);
          }
        }}
      />

      <RevertSubscriptionModal
        open={revertModalOpen}
        pending={pending}
        onConfirm={() => void handleConfirmRevert()}
        onClose={() => {
          if (!pending) setRevertModalOpen(false);
        }}
      />
    </>
  );
}
