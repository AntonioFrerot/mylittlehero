"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { useIsAdmin } from "@/components/auth/AuthProvider";
import { BTN_HEADER_ADMIN } from "@/lib/ui/button-3d-classes";

type HeaderAdminButtonProps = {
  className?: string;
  compact?: boolean;
};

export function HeaderAdminButton({
  className = "",
  compact = false,
}: HeaderAdminButtonProps) {
  const { t } = useLocale();
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className={`${BTN_HEADER_ADMIN} ${compact ? "header-admin-btn--compact" : ""} ${className}`.trim()}
    >
      {t("nav.admin")}
    </Link>
  );
}
