"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { ManageSubscriptionButton } from "@/components/espace/ManageSubscriptionButton";
import { isCommitmentSubscriptionPlan } from "@/lib/stripe/subscription-commitment";

type SubscriptionStatus = {
  active: boolean;
  planId?: string;
  hasCommitment?: boolean;
  commitmentActive?: boolean;
  commitmentEndDate?: string | null;
  cancellationScheduled?: boolean;
  cancellationDate?: string | null;
  cancellationPreviewMode?: "commitment" | "period_end";
  cancellationPreviewDate?: string | null;
};

type SubscriptionProfileBlockProps = {
  planName: string | null;
  subscriptionPlanId?: string;
};

export function SubscriptionProfileBlock({
  planName,
  subscriptionPlanId,
}: SubscriptionProfileBlockProps) {
  const { t } = useLocale();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(Boolean(subscriptionPlanId));

  const refreshStatus = useCallback(async () => {
    if (!subscriptionPlanId) {
      setStatus({ active: false });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/subscription-status");
      if (!response.ok) {
        setStatus({ active: true, planId: subscriptionPlanId });
        return;
      }
      const data = (await response.json()) as SubscriptionStatus;
      setStatus(data);
    } catch {
      setStatus({ active: true, planId: subscriptionPlanId });
    } finally {
      setLoading(false);
    }
  }, [subscriptionPlanId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  if (!subscriptionPlanId) {
    return (
      <div className="subscription-profile-block subscription-profile-block--empty">
        <p className="subscription-profile-block__empty-text">
          {t("space.noSubscription")}
        </p>
        <Button
          href="/abonnements"
          variant="secondary"
          className="subscription-profile-block__cta w-full !text-sm sm:w-auto"
        >
          {t("purchase.viewSubscriptions")}
        </Button>
      </div>
    );
  }

  const hasCommitment =
    status?.hasCommitment ?? isCommitmentSubscriptionPlan(subscriptionPlanId);

  return (
    <div className="subscription-profile-block">
      <div className="subscription-profile-block__main">
        <div className="subscription-profile-block__header">
          <div className="min-w-0">
            <p className="subscription-profile-block__eyebrow">
              {t("space.subscriptionPlanEyebrow")}
            </p>
            <p className="subscription-profile-block__plan">
              {planName ?? subscriptionPlanId}
            </p>
            {hasCommitment && status?.commitmentEndDate && status.commitmentActive ? (
              <p className="subscription-profile-block__committed-until">
                {t("space.subscriptionCommittedUntil", {
                  date: status.commitmentEndDate,
                })}
              </p>
            ) : null}
          </div>
          <span className="subscription-profile-block__badge" aria-hidden>
            {t("space.subscriptionActiveBadge")}
          </span>
        </div>

        <dl className="subscription-profile-block__facts">
          <div className="subscription-profile-block__fact">
            <dt>{t("space.subscriptionBillingLabel")}</dt>
            <dd>{t("space.subscriptionBillingMonthly")}</dd>
          </div>
          <div className="subscription-profile-block__fact">
            <dt>{t("space.subscriptionCommitmentLabel")}</dt>
            <dd>
              {hasCommitment
                ? t("space.subscriptionCommitment12Months")
                : t("space.subscriptionCommitmentNone")}
            </dd>
          </div>
          {hasCommitment && status?.commitmentEndDate ? (
            <div className="subscription-profile-block__fact subscription-profile-block__fact--wide">
              <dt>{t("space.subscriptionCommitmentEndLabel")}</dt>
              <dd>{status.commitmentEndDate}</dd>
            </div>
          ) : null}
        </dl>

        {!loading && status?.cancellationScheduled && status.cancellationDate ? (
          <p className="subscription-profile-block__notice" role="status">
            {t("space.subscriptionCancellationPending", {
              date: status.cancellationDate,
            })}
          </p>
        ) : null}
      </div>

      <div className="subscription-profile-block__footer">
        <ManageSubscriptionButton
          className="subscription-profile-block__cta w-full !text-sm sm:w-auto"
          cancellationScheduled={Boolean(status?.cancellationScheduled)}
          cancellationPreviewDate={status?.cancellationPreviewDate ?? null}
          cancellationPreviewMode={status?.cancellationPreviewMode ?? "period_end"}
          onScheduled={() => void refreshStatus()}
        />
      </div>
    </div>
  );
}
