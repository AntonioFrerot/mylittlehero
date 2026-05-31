"use client";

import { BTN_3D_SECONDARY_ACTION } from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";
import { signOut } from "@/lib/auth/actions";

const buttonClasses = BTN_3D_SECONDARY_ACTION;

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
