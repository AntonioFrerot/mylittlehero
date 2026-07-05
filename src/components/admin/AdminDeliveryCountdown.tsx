"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  formatDeliveryRemaining,
  getDeliveryDeadlineState,
} from "@/lib/film-creation/delivery-deadline";

type AdminDeliveryCountdownProps = {
  createdAt: string;
  compact?: boolean;
};

export function AdminDeliveryCountdown({
  createdAt,
  compact = false,
}: AdminDeliveryCountdownProps) {
  const { t } = useLocale();
  const [state, setState] = useState(() => getDeliveryDeadlineState(createdAt));

  useEffect(() => {
    const tick = () => {
      setState(getDeliveryDeadlineState(createdAt));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [createdAt]);

  const timerClass = state.overdue
    ? "admin-delivery-countdown__timer admin-delivery-countdown__timer--overdue"
    : state.remainingMs <= 2 * 60 * 60 * 1000
      ? "admin-delivery-countdown__timer admin-delivery-countdown__timer--warning"
      : "admin-delivery-countdown__timer";

  return (
    <div
      className={`admin-delivery-countdown${compact ? " admin-delivery-countdown--compact" : ""}${
        state.overdue ? " admin-delivery-countdown--overdue" : ""
      }`}
    >
      <p className="admin-delivery-countdown__label">
        {state.overdue
          ? t("admin.deliveryCountdownOverdue")
          : t("admin.deliveryCountdownLabel")}
      </p>
      <p className={timerClass} role="timer" aria-live="polite" aria-atomic="true">
        {formatDeliveryRemaining(state.remainingMs)}
      </p>
      {!compact ? (
        <p className="admin-delivery-countdown__hint">{t("admin.deliveryCountdownHint")}</p>
      ) : null}
    </div>
  );
}
