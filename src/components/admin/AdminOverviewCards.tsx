"use client";

import type { AdminDashboardSummary } from "@/lib/admin/summary";
import { useLocale } from "@/components/LocaleProvider";

type AdminOverviewCardsProps = {
  summary: AdminDashboardSummary | null;
};

export function AdminOverviewCards({ summary }: AdminOverviewCardsProps) {
  const { t } = useLocale();

  if (!summary) return null;

  const cards = [
    {
      label: t("admin.overview.awaitingFilms"),
      value: summary.awaitingFilmsCount,
      accent: summary.awaitingFilmsCount > 0,
    },
    {
      label: t("admin.overview.clients"),
      value: summary.clientCount,
      accent: false,
    },
  ];

  return (
    <div className="admin-overview-cards">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`admin-overview-card${card.accent ? " admin-overview-card--accent" : ""}`}
        >
          <p className="admin-overview-card__label">{card.label}</p>
          <p className="admin-overview-card__value">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
