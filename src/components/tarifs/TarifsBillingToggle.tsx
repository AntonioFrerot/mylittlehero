"use client";

import { useLocale } from "@/components/LocaleProvider";

export type TarifsBillingCycle = "monthly" | "yearly";

type TarifsBillingToggleProps = {
  value: TarifsBillingCycle;
  onChange: (value: TarifsBillingCycle) => void;
  savingsPercent: number;
};

function GiftIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 8 12 8" />
      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C15 3 12 8 12 8" />
    </svg>
  );
}

export function TarifsBillingToggle({
  value,
  onChange,
  savingsPercent,
}: TarifsBillingToggleProps) {
  const { t } = useLocale();
  const isYearly = value === "yearly";

  return (
    <div
      className="tarifs-billing-toggle"
      role="radiogroup"
      aria-label={t("tarifsPage.billingToggle.label")}
    >
      <span
        className={`tarifs-billing-toggle__slider ${
          isYearly ? "tarifs-billing-toggle__slider--yearly" : ""
        }`}
        aria-hidden
      />
      <button
        type="button"
        role="radio"
        aria-checked={!isYearly}
        className={`tarifs-billing-toggle__option tarifs-billing-toggle__option--monthly ${
          !isYearly ? "tarifs-billing-toggle__option--active" : ""
        }`}
        onClick={() => onChange("monthly")}
      >
        {t("tarifsPage.billingToggle.monthly")}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={isYearly}
        className={`tarifs-billing-toggle__option tarifs-billing-toggle__option--yearly ${
          isYearly ? "tarifs-billing-toggle__option--active" : ""
        }`}
        onClick={() => onChange("yearly")}
      >
        <span>{t("tarifsPage.billingToggle.yearly")}</span>
        <span
          className={`tarifs-billing-toggle__savings ${
            isYearly
              ? "tarifs-billing-toggle__savings--on-gold"
              : "tarifs-billing-toggle__savings--promo"
          }`}
        >
          <GiftIcon />
          {t("tarifsPage.billingToggle.savingsBadge", { percent: savingsPercent })}
        </span>
      </button>
    </div>
  );
}
