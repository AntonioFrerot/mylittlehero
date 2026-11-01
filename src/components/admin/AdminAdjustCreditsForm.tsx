"use client";

import { useActionState, useState, type FormEvent } from "react";
import {
  adjustAdminCredits,
  type AdminAdjustCreditsState,
} from "@/lib/admin/actions";
import {
  BTN_3D_PRIMARY_ACTION,
  BTN_3D_SECONDARY_ACTION,
  SURFACE_3D_FORM_CONTROL,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";

const initialState: AdminAdjustCreditsState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type CreditKind = "tickets" | "jetons";

type AdminAdjustCreditsFormProps = {
  defaultEmail?: string;
};

export function AdminAdjustCreditsForm({ defaultEmail = "" }: AdminAdjustCreditsFormProps) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(adjustAdminCredits, initialState);
  const [selectedKinds, setSelectedKinds] = useState<Record<CreditKind, boolean>>({
    tickets: true,
    jetons: false,
  });
  const [clientError, setClientError] = useState<string | null>(null);

  function toggleKind(kind: CreditKind) {
    setSelectedKinds((current) => ({ ...current, [kind]: !current[kind] }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selectedKinds.tickets && !selectedKinds.jetons) {
      event.preventDefault();
      setClientError(t("admin.creditsAdjustNoKindError"));
      return;
    }
    setClientError(null);
  }

  return (
    <section className={`${SURFACE_3D_PANEL_LG} p-5 md:p-6`}>
      <div className="max-w-xl">
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          {t("admin.creditsAdjustTitle")}
        </h2>
        <p className="mt-2 text-sm text-cream/60">{t("admin.creditsAdjustLead")}</p>
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="mt-6 flex max-w-xl flex-col gap-5"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.creditsAdjustEmailLabel")}</span>
          <input
            type="email"
            name="email"
            required
            key={defaultEmail}
            defaultValue={defaultEmail}
            className={inputClass}
            placeholder="client@exemple.fr"
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm text-cream/70">{t("admin.creditsAdjustKindLabel")}</legend>
          <p className="text-xs text-cream/45">{t("admin.creditsAdjustKindHint")}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {(["tickets", "jetons"] as const).map((kind) => {
              const checked = selectedKinds[kind];
              const label =
                kind === "tickets"
                  ? t("admin.creditsAdjustKindTickets")
                  : t("admin.creditsAdjustKindJetons");
              return (
                <label
                  key={kind}
                  className={`${SURFACE_3D_FORM_CONTROL} flex min-h-[3rem] flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors sm:min-w-[10rem] sm:flex-initial ${
                    checked
                      ? "border-gold/55 bg-gold/15 text-cream ring-1 ring-gold/35"
                      : "border-white/12 text-cream/55 hover:border-white/22 hover:text-cream/80"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm font-bold leading-none transition-colors ${
                      checked
                        ? "border-gold-light bg-gold text-cinema-black"
                        : "border-white/35 bg-cinema-black/70 text-transparent"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <input
                    type="checkbox"
                    name="creditKinds"
                    value={kind}
                    checked={checked}
                    onChange={() => toggleKind(kind)}
                    className="sr-only"
                  />
                  <span className="font-medium">{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.creditsAdjustCountLabel")}</span>
          <input
            type="number"
            name="amount"
            required
            min={1}
            step={1}
            defaultValue={50}
            className={inputClass}
          />
        </label>

        {clientError || state.error ? (
          <p className="text-sm text-red-300" role="alert">
            {clientError ?? state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-emerald-300" role="status">
            {state.success}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            name="operation"
            value="grant"
            disabled={pending}
            className={`${BTN_3D_PRIMARY_ACTION} w-full sm:flex-1 disabled:opacity-60`}
          >
            {pending ? t("admin.creditsAdjustSubmitting") : t("admin.creditsAdjustAdd")}
          </button>
          <button
            type="submit"
            name="operation"
            value="revoke"
            disabled={pending}
            className={`${BTN_3D_SECONDARY_ACTION} w-full border-red-400/30 text-red-200 hover:border-red-300/50 hover:bg-red-950/30 sm:flex-1 disabled:opacity-60`}
          >
            {pending ? t("admin.creditsAdjustSubmitting") : t("admin.creditsAdjustRemove")}
          </button>
        </div>
      </form>
    </section>
  );
}
