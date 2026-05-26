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

  if (user) {
    const label = user.name ?? user.email.split("@")[0];
    return (
      <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-3">
        <p className="px-3 text-sm text-cream/60">
          {t("nav.mySpace")} : <span className="text-cream">{label}</span>
        </p>
        <Button
          href="/mon-espace"
          variant="primary"
          className="w-full !py-2.5 !text-sm"
          onClick={onNavigate}
        >
          {t("nav.mySpace")}
        </Button>
        <LogoutButton fullWidth />
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <Button
        href="/connexion"
        variant="secondary"
        className="w-full !py-2.5 !text-sm"
        onClick={onNavigate}
      >
        {t("nav.login")}
      </Button>
      <Button
        href="/connexion?mode=signup"
        variant="primary"
        className="w-full !py-2.5 !text-sm"
        onClick={onNavigate}
      >
        {t("nav.signup")}
      </Button>
    </div>
  );
}
