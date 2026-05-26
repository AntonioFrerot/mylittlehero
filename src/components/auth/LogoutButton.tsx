"use client";

import { useLocale } from "@/components/LocaleProvider";
import { signOut } from "@/lib/auth/actions";

const buttonClasses =
  "inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-2 text-sm text-cream backdrop-blur-sm transition-all duration-300 hover:border-gold/70 hover:bg-white/10 active:scale-[0.98]";

type LogoutButtonProps = {
  className?: string;
  fullWidth?: boolean;
};

export function LogoutButton({ className = "", fullWidth }: LogoutButtonProps) {
  const { t } = useLocale();

  return (
    <form action={signOut} className={fullWidth ? "w-full" : undefined}>
      <button
        type="submit"
        className={`${buttonClasses} ${fullWidth ? "w-full" : ""} ${className}`}
      >
        {t("nav.logout")}
      </button>
    </form>
  );
}
