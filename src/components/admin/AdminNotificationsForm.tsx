"use client";

import { useActionState, useState } from "react";
import {
  sendAdminNotifications,
  type AdminSendNotificationsState,
} from "@/lib/admin/notification-actions";
import { BTN_3D_PRIMARY_ACTION, SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";

const initialState: AdminSendNotificationsState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

export function AdminNotificationsForm() {
  const { t } = useLocale();
  const [target, setTarget] = useState("all");
  const [state, formAction, pending] = useActionState(
    sendAdminNotifications,
    initialState
  );

  return (
    <section className={`${SURFACE_3D_PANEL_LG} p-5 md:p-6`}>
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          {t("admin.notificationsTitle")}
        </h2>
        <p className="mt-2 text-sm text-cream/60">{t("admin.notificationsLead")}</p>
      </div>

      <form action={formAction} className="mt-6 flex max-w-2xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.notificationsTargetLabel")}</span>
          <select
            name="target"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className={inputClass}
          >
            <option value="all">{t("admin.notificationsTargetAll")}</option>
            <option value="emails">{t("admin.notificationsTargetEmails")}</option>
            <option value="has_films">{t("admin.notificationsTargetHasFilms")}</option>
            <option value="has_ready_film">
              {t("admin.notificationsTargetHasReadyFilm")}
            </option>
            <option value="has_film_awaiting_delivery">
              {t("admin.notificationsTargetAwaitingDelivery")}
            </option>
          </select>
        </label>

        {target === "emails" ? (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-cream/70">{t("admin.notificationsEmailsLabel")}</span>
            <textarea
              name="emails"
              rows={4}
              className={`${inputClass} resize-y min-h-[100px]`}
              placeholder={t("admin.notificationsEmailsPlaceholder")}
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.notificationsTitleLabel")}</span>
          <input type="text" name="title" required className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.notificationsDescriptionLabel")}</span>
          <textarea
            name="description"
            rows={4}
            required
            className={`${inputClass} resize-y min-h-[110px]`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.notificationsHrefLabel")}</span>
          <input
            type="text"
            name="href"
            className={inputClass}
            placeholder="/mon-espace/films/..."
          />
          <span className="text-xs text-cream/45">{t("admin.notificationsHrefHint")}</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("admin.notificationsImageLabel")}</span>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-cream/70 file:mr-4 file:rounded-lg file:border-0 file:bg-gold/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gold-light"
          />
          <span className="text-xs text-cream/45">{t("admin.notificationsImageHint")}</span>
        </label>

        {state.error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={`mt-1 w-fit ${BTN_3D_PRIMARY_ACTION}`}
        >
          {pending
            ? t("admin.notificationsSubmitting")
            : t("admin.notificationsSubmit")}
        </button>
      </form>
    </section>
  );
}
