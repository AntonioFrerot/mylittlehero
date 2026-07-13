"use client";

import { useEffect, type MouseEvent } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";

type CancelSubscriptionModalProps = {
  open: boolean;
  effectiveDate: string | null;
  mode: "commitment" | "period_end";
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function CancelSubscriptionModal({
  open,
  effectiveDate,
  mode,
  pending = false,
  error = null,
  onConfirm,
  onClose,
}: CancelSubscriptionModalProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose, pending]);

  if (!open || !effectiveDate) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (pending) return;
    if ((event.target as HTMLElement).closest(".tickets-required-modal__panel")) return;
    onClose();
  };

  const lead =
    mode === "commitment"
      ? t("space.cancelSubscriptionModalLeadCommitment", { date: effectiveDate })
      : t("space.cancelSubscriptionModalLeadPeriodEnd", { date: effectiveDate });

  return (
    <div
      className="tickets-required-modal fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div className="tickets-required-modal__backdrop absolute inset-0" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-subscription-modal-title"
        className="tickets-required-modal__panel relative z-[1] w-full max-w-[24rem]"
      >
        <div className="tickets-required-modal__shine-top" aria-hidden />
        <button
          type="button"
          className="tickets-required-modal__close"
          aria-label={t("space.cancelSubscriptionModalDismiss")}
          disabled={pending}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="tickets-required-modal__inner cancel-subscription-modal__inner">
          <p className="tickets-required-modal__eyebrow">
            {t("space.cancelSubscriptionModalEyebrow")}
          </p>
          <h2
            id="cancel-subscription-modal-title"
            className="cancel-subscription-modal__title"
          >
            {t("space.cancelSubscriptionModalTitle")}
          </h2>
          <p className="cancel-subscription-modal__date">{effectiveDate}</p>
          <p className="cancel-subscription-modal__lead">{lead}</p>

          {error ? (
            <p
              className="subscription-profile-block__feedback subscription-profile-block__feedback--error cancel-subscription-modal__error"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="cancel-subscription-modal__actions">
            <Button
              type="button"
              variant="secondary"
              className="w-full !text-sm"
              disabled={pending}
              onClick={onClose}
            >
              {t("space.cancelSubscriptionModalDismiss")}
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-full !text-sm"
              disabled={pending}
              onClick={onConfirm}
            >
              {pending
                ? t("space.cancelling")
                : t("space.cancelSubscriptionModalConfirm")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
