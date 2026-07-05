"use client";

import { useActionState } from "react";
import {
  grantTicketsToUser,
  revokeTicketsFromUser,
  type AdminGrantTicketsState,
  type AdminRevokeTicketsState,
} from "@/lib/admin/actions";
import {
  BTN_3D_PRIMARY_ACTION,
  BTN_3D_SECONDARY_ACTION,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";

const grantInitialState: AdminGrantTicketsState = {};
const revokeInitialState: AdminRevokeTicketsState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type AdminGrantTicketsFormProps = {
  defaultEmail?: string;
};

export function AdminGrantTicketsForm({ defaultEmail = "" }: AdminGrantTicketsFormProps) {
  const { t } = useLocale();
  const [grantState, grantAction, grantPending] = useActionState(
    grantTicketsToUser,
    grantInitialState
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeTicketsFromUser,
    revokeInitialState
  );

  return (
    <section className={`${SURFACE_3D_PANEL_LG} p-5 md:p-6`}>
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          {t("admin.grantTicketsTitle")}
        </h2>
        <p className="mt-2 text-sm text-cream/60">{t("admin.grantTicketsLead")}</p>
      </div>

      <form action={grantAction} className="mt-6 flex max-w-2xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.grantTicketsEmailLabel")}</span>
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
          <span className="text-cream/70">{t("admin.grantTicketsCountLabel")}</span>
          <input
            type="number"
            name="tickets"
            required
            min={1}
            step={1}
            defaultValue={50}
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
          {grantPending ? t("admin.grantTicketsSubmitting") : t("admin.grantTicketsSubmit")}
        </button>
      </form>

      <div
        className="my-8 h-px max-w-2xl bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        aria-hidden
      />

      <div className="max-w-2xl">
        <h3 className="font-display text-lg font-semibold text-cream md:text-xl">
          {t("admin.revokeTicketsTitle")}
        </h3>
        <p className="mt-2 text-sm text-cream/60">{t("admin.revokeTicketsLead")}</p>
      </div>

      <form action={revokeAction} className="mt-6 flex max-w-2xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.revokeTicketsEmailLabel")}</span>
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
          <span className="text-cream/70">{t("admin.revokeTicketsCountLabel")}</span>
          <input
            type="number"
            name="tickets"
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
          {revokePending ? t("admin.revokeTicketsSubmitting") : t("admin.revokeTicketsSubmit")}
        </button>
      </form>
    </section>
  );
}
