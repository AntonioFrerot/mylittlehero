"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  setAdminOwnSubscription,
  type AdminSetSubscriptionState,
} from "@/lib/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import {
  BTN_3D_PRIMARY_ACTION,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";

const initialState: AdminSetSubscriptionState = {};

type AdminSubscriptionSimulatorFormProps = {
  adminEmail: string;
  currentPlanId?: string | null;
};

type SimulatorOption = {
  value: string;
  labelKey: "admin.subscriptionSimulator.none" | "admin.subscriptionSimulator.essential" | "admin.subscriptionSimulator.premium";
};

const OPTIONS: SimulatorOption[] = [
  { value: "", labelKey: "admin.subscriptionSimulator.none" },
  { value: "standard-monthly", labelKey: "admin.subscriptionSimulator.essential" },
  { value: "unlimited-monthly", labelKey: "admin.subscriptionSimulator.premium" },
];

function normalizeCurrentPlan(planId?: string | null): string {
  if (!planId?.trim()) return "";
  if (planId.startsWith("standard-")) return "standard-monthly";
  if (planId.startsWith("unlimited-")) return "unlimited-monthly";
  return "";
}

export function AdminSubscriptionSimulatorForm({
  adminEmail,
  currentPlanId = null,
}: AdminSubscriptionSimulatorFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    setAdminOwnSubscription,
    initialState
  );
  const selected = normalizeCurrentPlan(currentPlanId);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <section className={`${SURFACE_3D_PANEL_LG} p-5 md:p-6`}>
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          {t("admin.subscriptionSimulator.title")}
        </h2>
        <p className="mt-2 text-sm text-cream/60">
          {t("admin.subscriptionSimulator.lead")}
        </p>
        <p className="mt-2 text-xs text-cream/45">
          {t("admin.subscriptionSimulator.accountLabel", { email: adminEmail })}
        </p>
      </div>

      <form action={formAction} className="mt-6 flex max-w-2xl flex-col gap-4">
        <fieldset className="space-y-3">
          <legend className="sr-only">{t("admin.subscriptionSimulator.title")}</legend>
          {OPTIONS.map((option) => (
            <label
              key={option.value || "none"}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                selected === option.value
                  ? "border-gold/40 bg-gold/10"
                  : "border-white/10 bg-cinema-black/40 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="subscriptionPlanId"
                value={option.value}
                defaultChecked={selected === option.value}
                className="mt-1 accent-[var(--gold)]"
              />
              <span className="text-sm text-cream">{t(option.labelKey)}</span>
            </label>
          ))}
        </fieldset>

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
          {pending
            ? t("admin.subscriptionSimulator.submitting")
            : t("admin.subscriptionSimulator.submit")}
        </button>
      </form>
    </section>
  );
}
