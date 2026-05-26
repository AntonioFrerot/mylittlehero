"use client";

import { useActionState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  submitContactMessage,
  type ContactFormState,
} from "@/lib/contact/actions";

const initialState: ContactFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type ContactFormProps = {
  defaultEmail?: string;
};

export function ContactForm({ defaultEmail }: ContactFormProps) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState
  );

  if (state.success) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-8 text-center">
        <p className="font-display text-xl font-semibold text-cream">
          {t("common.thankYou")}
        </p>
        <p className="mt-3 text-cream/65">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-cream/70">{t("contact.form.name")}</span>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-cream/70">{t("contact.form.email")}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-cream/70">{t("contact.form.message")}</span>
        <textarea
          name="message"
          required
          rows={6}
          className={`${inputClass} min-h-[140px] resize-y`}
        />
      </label>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-3.5 text-sm font-semibold text-cinema-black shadow-glow-gold transition-all hover:brightness-110 disabled:opacity-60"
      >
        {pending ? t("contact.form.sending") : t("contact.form.submit")}
      </button>
    </form>
  );
}
