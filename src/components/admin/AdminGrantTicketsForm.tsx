"use client";

import { useActionState } from "react";
import {
  grantTicketsToUser,
  type AdminGrantTicketsState,
} from "@/lib/admin/actions";
import { BTN_3D_PRIMARY_ACTION, SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";

const initialState: AdminGrantTicketsState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type AdminGrantTicketsFormProps = {
  defaultEmail?: string;
};

export function AdminGrantTicketsForm({ defaultEmail = "" }: AdminGrantTicketsFormProps) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    grantTicketsToUser,
    initialState
  );

  return (
    <section className={`${SURFACE_3D_PANEL_LG} p-5 md:p-6`}>
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          {t("admin.grantTicketsTitle")}
        </h2>
        <p className="mt-2 text-sm text-cream/60">{t("admin.grantTicketsLead")}</p>
      </div>

      <form action={formAction} className="mt-6 flex max-w-2xl flex-col gap-4">
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

        {state.error ? (
          <p className="text-sm text-red-300" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-emerald-300" role="status">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={`${BTN_3D_PRIMARY_ACTION} w-full sm:w-auto disabled:opacity-60`}
        >
          {pending ? t("admin.grantTicketsSubmitting") : t("admin.grantTicketsSubmit")}
        </button>
      </form>
    </section>
  );
}
