"use client";

import Link from "next/link";
import { BTN_3D_NAV_ACTIVE, BTN_3D_NAV_INACTIVE } from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";
import { ESPACE_SECTIONS, type EspaceSection } from "@/lib/espace/sections";
import type { TranslationKey } from "@/lib/i18n/translator";

const SECTION_KEYS: Record<EspaceSection, TranslationKey> = {
  profil: "space.profile",
  personnages: "space.characters",
  films: "space.films",
};

type MonEspaceNavProps = {
  active: EspaceSection;
};

export function MonEspaceNav({ active }: MonEspaceNavProps) {
  const { t } = useLocale();
  const items: EspaceSection[] = [...ESPACE_SECTIONS];

  return (
    <nav
      className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none"
      aria-label={t("space.navLabel")}
    >
      {items.map((section) => {
        const isActive = section === active;
        return (
          <Link
            key={section}
            href={`/mon-espace?section=${section}`}
            className={`transition-all ${isActive ? BTN_3D_NAV_ACTIVE : BTN_3D_NAV_INACTIVE}`}
            aria-current={isActive ? "page" : undefined}
          >
            {t(SECTION_KEYS[section])}
          </Link>
        );
      })}
    </nav>
  );
}
