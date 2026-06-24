"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { formatCooldownRemaining } from "@/lib/film-creation/creation-cooldown";

function getRemainingMs(endsAt: string): number {
  return Math.max(0, new Date(endsAt).getTime() - Date.now());
}

type FilmCreationCooldownProps = {
  endsAt: string;
  onCooldownEnd?: () => void;
};

export function FilmCreationCooldown({
  endsAt,
  onCooldownEnd,
}: FilmCreationCooldownProps) {
  const { t } = useLocale();
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(endsAt));

  useEffect(() => {
    const tick = () => {
      const next = getRemainingMs(endsAt);
      setRemainingMs(next);
      if (next <= 0) {
        onCooldownEnd?.();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [endsAt, onCooldownEnd]);

  if (remainingMs <= 0) {
    return null;
  }

  return (
    <div className="film-create-cooldown">
      <p className="film-create-cooldown__label">
        {t("filmCreation.form.cooldownTimerLabel")}
      </p>
      <p
        className="film-create-cooldown__timer"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatCooldownRemaining(remainingMs)}
      </p>
    </div>
  );
}
