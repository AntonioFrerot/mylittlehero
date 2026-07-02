"use client";

import { useLocale } from "@/components/LocaleProvider";

export type AbonnementsCatalogTab = "tickets" | "subscriptions";

type AbonnementsCatalogToggleProps = {
  value: AbonnementsCatalogTab;
  onChange: (value: AbonnementsCatalogTab) => void;
};

export function AbonnementsCatalogToggle({
  value,
  onChange,
}: AbonnementsCatalogToggleProps) {
  const { t } = useLocale();
  const isSubscriptions = value === "subscriptions";

  return (
    <div
      className="tarifs-billing-toggle tarifs-billing-toggle--equal"
      role="radiogroup"
      aria-label={t("abonnementsPage.catalogToggle.label")}
    >
      <span
        className={`tarifs-billing-toggle__slider ${
          isSubscriptions ? "tarifs-billing-toggle__slider--yearly" : ""
        }`}
        aria-hidden
      />
      <button
        type="button"
        role="radio"
        aria-checked={!isSubscriptions}
        className={`tarifs-billing-toggle__option tarifs-billing-toggle__option--monthly ${
          !isSubscriptions ? "tarifs-billing-toggle__option--active" : ""
        }`}
        onClick={() => onChange("tickets")}
      >
        {t("abonnementsPage.catalogToggle.tickets")}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={isSubscriptions}
        className={`tarifs-billing-toggle__option tarifs-billing-toggle__option--yearly ${
          isSubscriptions ? "tarifs-billing-toggle__option--active" : ""
        }`}
        onClick={() => onChange("subscriptions")}
      >
        {t("abonnementsPage.catalogToggle.subscriptions")}
      </button>
    </div>
  );
}
