"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

type WithdrawalWaiverFieldProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function WithdrawalWaiverField({
  id,
  checked,
  onChange,
}: WithdrawalWaiverFieldProps) {
  const { t } = useLocale();

  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 text-left text-xs leading-relaxed text-cream/55"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-cinema-black/60 text-gold focus:ring-gold/40"
      />
      <span>
        {t("checkout.withdrawalWaiverBefore")}{" "}
        <Link
          href="/cgv"
          className="text-gold-light underline-offset-2 hover:text-gold hover:underline"
        >
          {t("legal.documents.cgv")}
        </Link>
        {t("checkout.withdrawalWaiverAfter")}
      </span>
    </label>
  );
}
