"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  signIn,
  signUp,
  type AuthFormState,
} from "@/lib/auth/actions";
import {
  AUTH_REDIRECT_LOGIN_DEFAULT,
  AUTH_REDIRECT_SIGNUP_DEFAULT,
} from "@/lib/auth/redirect-paths";

import {
  BTN_3D_PRIMARY_ACTION,
  BTN_3D_TAB_ACTIVE,
  SURFACE_3D_TAB_SHELL,
} from "@/lib/ui/button-3d-classes";

type AuthMode = "login" | "signup";

const initialState: AuthFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type AuthFormProps = {
  /** Redirection explicite (?redirect=) — sinon défaut selon connexion / inscription. */
  redirectFromUrl?: string;
  initialMode?: AuthMode;
};

export function AuthForm({
  redirectFromUrl,
  initialMode = "login",
}: AuthFormProps) {
  const { t } = useLocale();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginState, loginAction, loginPending] = useActionState(signIn, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signUp, initialState);

  const isLogin = mode === "login";
  const redirectTo =
    redirectFromUrl ??
    (isLogin ? AUTH_REDIRECT_LOGIN_DEFAULT : AUTH_REDIRECT_SIGNUP_DEFAULT);
  const state = isLogin ? loginState : signupState;
  const pending = isLogin ? loginPending : signupPending;

  return (
    <div className="btn-3d btn-3d--secondary rounded-2xl p-6 shadow-glow-gold-subtle md:p-8">
      <div
        className={SURFACE_3D_TAB_SHELL}
        role="tablist"
        aria-label={t("auth.tabsLabel")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          className={`${isLogin ? BTN_3D_TAB_ACTIVE : "flex-1 rounded-full py-2.5 text-sm font-medium text-cream/60 transition-all hover:text-cream"}`}
          onClick={() => setMode("login")}
        >
          {t("auth.tabLogin")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          className={`${!isLogin ? BTN_3D_TAB_ACTIVE : "flex-1 rounded-full py-2.5 text-sm font-medium text-cream/60 transition-all hover:text-cream"}`}
          onClick={() => setMode("signup")}
        >
          {t("auth.tabSignup")}
        </button>
      </div>

      <p className="mb-6 text-center text-sm text-cream/60">
        {isLogin ? t("auth.loginHint") : t("auth.signupHint")}
      </p>

      <form
        key={mode}
        action={isLogin ? loginAction : signupAction}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="redirect" value={redirectTo} />

        {!isLogin && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-cream/70">{t("auth.nameOptional")}</span>
            <input
              type="text"
              name="name"
              autoComplete="given-name"
              className={inputClass}
              placeholder={t("auth.namePlaceholder")}
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("auth.email")} :</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder={t("auth.emailPlaceholder")}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-cream/70">{t("auth.password")} :</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className={inputClass}
            placeholder={t("auth.passwordPlaceholder")}
          />
        </label>

        {!isLogin && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-cream/70">{t("auth.confirmPassword")} :</span>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
              placeholder={t("auth.confirmPasswordPlaceholder")}
            />
          </label>
        )}

        {!isLogin && (
          <label className="flex items-start gap-3 text-xs leading-relaxed text-cream/50">
            <input
              type="checkbox"
              name="acceptTerms"
              value="1"
              required
              className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-cinema-black/60 text-gold focus:ring-gold/40"
            />
            <span>
              {t("auth.acceptTermsLead")}{" "}
              <Link
                href="/cgu"
                className="text-gold-light underline-offset-2 hover:text-gold hover:underline"
              >
                {t("legal.documents.cgu")}
              </Link>{" "}
              {t("auth.acceptTermsAnd")}{" "}
              <Link
                href="/politique-de-confidentialite"
                className="text-gold-light underline-offset-2 hover:text-gold hover:underline"
              >
                {t("legal.documents.politiqueConfidentialite")}
              </Link>
              {t("auth.acceptTermsTail")}
            </span>
          </label>
        )}

        {state.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`mt-2 ${BTN_3D_PRIMARY_ACTION}`}
        >
          {pending
            ? t("auth.loading")
            : isLogin
              ? t("auth.submitLogin")
              : t("auth.submitSignup")}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-cream/40">
        {isLogin ? (
          <>
            {t("auth.termsPrefix")}{" "}
            <Link href="/cgu" className="text-gold-light/80 hover:text-gold-light">
              {t("legal.documents.cgu")}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
