"use client";

import { deliverFilmToClient, type AdminDeliverFilmState } from "@/lib/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

type AdminDeliverFilmFormProps = {
  ownerEmail: string;
  filmId: string;
  isFreeTrial?: boolean;
};

const initialState: AdminDeliverFilmState = {};

export function AdminDeliverFilmForm({
  ownerEmail,
  filmId,
  isFreeTrial = false,
}: AdminDeliverFilmFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deliverFilmToClient,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="rounded-xl border border-gold/25 bg-gold/5 p-4 md:p-5"
    >
      <input type="hidden" name="ownerEmail" value={ownerEmail} />
      <input type="hidden" name="filmId" value={filmId} />
      {isFreeTrial ? (
        <input type="hidden" name="isFreeTrial" value="1" />
      ) : null}

      <h3 className="text-sm font-semibold text-cream">
        {t("admin.deliveryTitle")}
      </h3>
      <p className="mt-1 text-xs text-cream/55">
        {isFreeTrial ? t("admin.deliveryLeadFreeTrial") : t("admin.deliveryLead")}
      </p>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-cream/45">
            {t("admin.youtubeUrlLabel")}
          </span>
          <input
            type="url"
            name="videoSrc"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:border-gold/40 focus:outline-none"
          />
          <span className="mt-1 block text-xs text-cream/45">
            {t("admin.youtubeUrlHint")}
          </span>
        </label>

        {!isFreeTrial ? (
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-cream/45">
              {t("admin.posterLabel")}
            </span>
            <input
              type="file"
              name="poster"
              accept="image/jpeg,image/png,image/webp"
              required
              className="mt-2 block w-full text-sm text-cream/70 file:mr-3 file:rounded-md file:border-0 file:bg-gold/20 file:px-3 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-gold/30"
            />
            <span className="mt-1 block text-xs text-cream/45">
              {t("admin.posterHint")}
            </span>
          </label>
        ) : null}
      </div>

      {state.error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-3 text-sm text-emerald-300" role="status">
          {state.success}
        </p>
      ) : null}

      <div className="mt-4">
        <Button type="submit" variant="primary" disabled={pending} glow={false}>
          {pending ? t("admin.deliverySubmitting") : t("admin.deliverySubmit")}
        </Button>
      </div>
    </form>
  );
}
