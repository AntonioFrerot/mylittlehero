"use client";

import {
  BTN_3D_PRIMARY_COMPACT,
  BTN_3D_SOFT_COMPACT,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { SubscriptionProfileBlock } from "@/components/espace/SubscriptionProfileBlock";
import {
  updateAccountLocale,
  updateAccountName,
  updateAccountPassword,
  type AccountFormState,
} from "@/lib/auth/account-actions";
import type { AccountDetails } from "@/lib/auth/users-store";
import { LOCALES, getLocaleLabel, parseLocale, type LocaleCode } from "@/lib/i18n/locales";
import { createTranslator } from "@/lib/i18n/translator";
import { findPricingPlanById } from "@/lib/pricing";

const initialState: AccountFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type AccountInformationsFormProps = {
  account: AccountDetails;
};

function FormMessage({
  state,
  successMessage,
}: {
  state: AccountFormState;
  successMessage?: string;
}) {
  if (state.error) {
    return (
      <p className="text-sm text-red-300/90" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="text-sm text-emerald-300/90" role="status">
        {successMessage ?? state.success}
      </p>
    );
  }
  return null;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className={`${SURFACE_3D_PANEL_LG} p-6 md:p-8`}>
      <h3 className="font-display text-lg font-semibold text-cream md:text-xl">
        {title}
      </h3>
      <p className="mt-2 text-sm text-cream/55">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function AccountInformationsForm({
  account,
}: AccountInformationsFormProps) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<LocaleCode>(account.locale);
  const hasActiveSubscription = Boolean(account.subscriptionPlanId?.trim());
  const subscriptionPlanName = useMemo(() => {
    if (!hasActiveSubscription) return null;
    const plan = findPricingPlanById(account.subscriptionPlanId!, locale);
    if (!plan) return null;
    return plan.tier === "standard"
      ? t("pricing.tierEssential")
      : t("pricing.tierPremium");
  }, [account.subscriptionPlanId, hasActiveSubscription, locale, t]);
  const saveLanguageT = useMemo(
    () => createTranslator(selectedLocale),
    [selectedLocale]
  );
  const [nameState, nameAction, namePending] = useActionState(
    updateAccountName,
    initialState
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updateAccountPassword,
    initialState
  );
  const [languageState, languageAction, languagePending] = useActionState(
    updateAccountLocale,
    initialState
  );

  useEffect(() => {
    setSelectedLocale(account.locale);
  }, [account.locale]);

  useEffect(() => {
    if (nameState.success || languageState.success) {
      router.refresh();
    }
  }, [nameState.success, languageState.success, router]);

  return (
    <div className="space-y-6">
      <SectionCard
        title={t("space.profileSectionTitle")}
        description={t("space.profileSectionDesc")}
      >
        <form action={nameAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="account-email" className="mb-1.5 block text-sm text-cream/70">
              {t("auth.email")}
            </label>
            <input
              id="account-email"
              type="email"
              value={account.email}
              readOnly
              className={`${inputClass} cursor-not-allowed opacity-70`}
            />
          </div>
          <div>
            <label htmlFor="account-name" className="mb-1.5 block text-sm text-cream/70">
              {t("auth.name")}
            </label>
            <input
              id="account-name"
              name="name"
              type="text"
              required
              defaultValue={account.name ?? ""}
              autoComplete="given-name"
              className={inputClass}
              placeholder={t("auth.name")}
            />
          </div>
          <FormMessage
            state={nameState}
            successMessage={
              nameState.success ? t("space.nameUpdated") : undefined
            }
          />
          <button
            type="submit"
            disabled={namePending}
            className={`w-fit ${BTN_3D_PRIMARY_COMPACT}`}
          >
            {namePending ? t("space.savingName") : t("space.saveName")}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title={t("space.languageTitle")}
        description={t("space.languageDesc")}
      >
        <form action={languageAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="site-locale"
              className="mb-1.5 block text-sm text-cream/70"
            >
              {t("space.languageLabel")}
            </label>
            <select
              id="site-locale"
              name="locale"
              value={selectedLocale}
              onChange={(event) => {
                const next = parseLocale(event.target.value);
                if (next) setSelectedLocale(next);
              }}
              className={inputClass}
            >
              {LOCALES.map((language) => (
                <option key={language.code} value={language.code}>
                  {getLocaleLabel(language.code, locale)}
                </option>
              ))}
            </select>
          </div>
          <FormMessage
            state={languageState}
            successMessage={
              languageState.success === "languageUpdated"
                ? t("space.languageUpdated")
                : undefined
            }
          />
          <button
            type="submit"
            disabled={languagePending}
            className={`w-fit ${BTN_3D_PRIMARY_COMPACT}`}
          >
            {languagePending
              ? saveLanguageT("space.savingLanguage")
              : saveLanguageT("space.saveLanguage")}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title={t("space.passwordTitle")}
        description={t("space.passwordDesc")}
      >
        <form action={passwordAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="current-password"
              className="mb-1.5 block text-sm text-cream/70"
            >
              {t("space.currentPassword")}
            </label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-sm text-cream/70"
            >
              {t("space.newPassword")}
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-sm text-cream/70"
            >
              {t("space.confirmNewPassword")}
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <FormMessage
            state={passwordState}
            successMessage={
              passwordState.success ? t("space.passwordUpdated") : undefined
            }
          />
          <button
            type="submit"
            disabled={passwordPending}
            className={`w-fit ${BTN_3D_SOFT_COMPACT}`}
          >
            {passwordPending
              ? t("space.updatingPassword")
              : t("space.updatePassword")}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title={t("space.subscriptionTitle")}
        description={t("space.subscriptionDesc")}
      >
        <SubscriptionProfileBlock
          planName={subscriptionPlanName}
          subscriptionPlanId={
            hasActiveSubscription ? account.subscriptionPlanId : undefined
          }
        />
      </SectionCard>
    </div>
  );
}
