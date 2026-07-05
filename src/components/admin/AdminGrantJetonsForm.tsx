"use client";

import { useActionState } from "react";
import {
  grantJetonsToUser,
  revokeJetonsFromUser,
  type AdminGrantJetonsState,
  type AdminRevokeJetonsState,
} from "@/lib/admin/actions";
import {
  BTN_3D_PRIMARY_ACTION,
  BTN_3D_SECONDARY_ACTION,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";

const grantInitialState: AdminGrantJetonsState = {};
const revokeInitialState: AdminRevokeJetonsState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type AdminGrantJetonsFormProps = {
  defaultEmail?: string;
};

export function AdminGrantJetonsForm({ defaultEmail = "" }: AdminGrantJetonsFormProps) {
  const { t } = useLocale();
  const [grantState, grantAction, grantPending] = useActionState(
    grantJetonsToUser,
    grantInitialState
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeJetonsFromUser,
    revokeInitialState
  );

  return (
    <section className={`${SURFACE_3D_PANEL_LG} p-5 md:p-6`}>
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          {t("admin.grantJetonsTitle")}
        </h2>
        <p className="mt-2 text-sm text-cream/60">{t("admin.grantJetonsLead")}</p>
      </div>

      <form action={grantAction} className="mt-6 flex max-w-2xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.grantJetonsEmailLabel")}</span>
          <input
            type="email"
            name="email"
            required
            defaultValue={defaultEmail}
            className={inputClass}
            placeholder="client@exemple.fr"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.grantJetonsCountLabel")}</span>
          <input
            type="number"
            name="jetons"
            required
            min={1}
            step={1}
            defaultValue={1}
            className={inputClass}
          />
        </label>

        {grantState.error ? (
          <p className="text-sm text-red-300" role="alert">
            {grantState.error}
          </p>
        ) : null}
        {grantState.success ? (
          <p className="text-sm text-emerald-300" role="status">
            {grantState.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={grantPending}
          className={`${BTN_3D_PRIMARY_ACTION} w-full sm:w-auto disabled:opacity-60`}
        >
          {grantPending ? t("admin.grantJetonsSubmitting") : t("admin.grantJetonsSubmit")}
        </button>
      </form>

      <div
        className="my-8 h-px max-w-2xl bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        aria-hidden
      />

      <div className="max-w-2xl">
        <h3 className="font-display text-lg font-semibold text-cream md:text-xl">
          {t("admin.revokeJetonsTitle")}
        </h3>
        <p className="mt-2 text-sm text-cream/60">{t("admin.revokeJetonsLead")}</p>
      </div>

      <form action={revokeAction} className="mt-6 flex max-w-2xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.revokeJetonsEmailLabel")}</span>
          <input
            type="email"
            name="email"
            required
            defaultValue={defaultEmail}
            className={inputClass}
            placeholder="client@exemple.fr"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.revokeJetonsCountLabel")}</span>
          <input
            type="number"
            name="jetons"
            required
            min={1}
            step={1}
            defaultValue={1}
            className={inputClass}
          />
        </label>

        {revokeState.error ? (
          <p className="text-sm text-red-300" role="alert">
            {revokeState.error}
          </p>
        ) : null}
        {revokeState.success ? (
          <p className="text-sm text-emerald-300" role="status">
            {revokeState.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={revokePending}
          className={`${BTN_3D_SECONDARY_ACTION} w-full border-red-400/30 text-red-200 hover:border-red-300/50 hover:bg-red-950/30 sm:w-auto disabled:opacity-60`}
        >
          {revokePending ? t("admin.revokeJetonsSubmitting") : t("admin.revokeJetonsSubmit")}
        </button>
      </form>
    </section>
  );
}
