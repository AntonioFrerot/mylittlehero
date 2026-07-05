"use client";

import { AdminGrantJetonsForm } from "@/components/admin/AdminGrantJetonsForm";
import { AdminGrantTicketsForm } from "@/components/admin/AdminGrantTicketsForm";
import { useLocale } from "@/components/LocaleProvider";

type AdminCreditsPanelProps = {
  grantEmail: string;
};

export function AdminCreditsPanel({ grantEmail }: AdminCreditsPanelProps) {
  const { t } = useLocale();

  return (
    <div className="admin-credits-panel space-y-6">
      {grantEmail ? (
        <p className="admin-selected-email rounded-xl border border-gold/25 bg-gold/8 px-4 py-3 text-sm text-cream/80">
          {t("admin.creditsSelectedEmail", { email: grantEmail })}
        </p>
      ) : null}

      <div className="admin-credits-panel__grid">
        <AdminGrantTicketsForm key={`tickets-${grantEmail}`} defaultEmail={grantEmail} />
        <AdminGrantJetonsForm key={`jetons-${grantEmail}`} defaultEmail={grantEmail} />
      </div>
    </div>
  );
}
