"use client";

import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useLocale } from "@/components/LocaleProvider";
import { useAuthUser } from "@/hooks/use-auth-user";

export function HeaderAuth() {
  const { t } = useLocale();
  const user = useAuthUser();

  if (user === undefined) {
    return (
      <div className="hidden h-9 w-56 animate-pulse rounded-full bg-white/5 md:block" />
    );
  }

  if (user) {
    return (
      <div className="hidden items-center justify-end gap-2 md:flex">
        <Button href="/mon-espace" variant="primary" className="!px-4 !py-2 !text-sm">
          {t("nav.mySpace")}
        </Button>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="hidden items-center justify-end gap-2 md:flex">
      <Button href="/connexion" variant="secondary" className="!px-4 !py-2 !text-sm">
        {t("nav.login")}
      </Button>
      <Button
        href="/connexion?mode=signup"
        variant="primary"
        className="!px-4 !py-2 !text-sm"
      >
        {t("nav.signup")}
      </Button>
    </div>
  );
}

export function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useLocale();
  const user = useAuthUser();
  const mobileAuthButtonClass =
    "w-full min-h-[44px] !px-6 !py-2.5 !text-sm";

  if (user) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          href="/mon-espace"
          variant="primary"
          className={mobileAuthButtonClass}
          onClick={onNavigate}
        >
          {t("nav.mySpace")}
        </Button>
        <LogoutButton fullWidth className={mobileAuthButtonClass} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        href="/connexion"
        variant="secondary"
        className={mobileAuthButtonClass}
        onClick={onNavigate}
      >
        {t("nav.login")}
      </Button>
      <Button
        href="/connexion?mode=signup"
        variant="primary"
        className={mobileAuthButtonClass}
        onClick={onNavigate}
      >
        {t("nav.signup")}
      </Button>
    </div>
  );
}
