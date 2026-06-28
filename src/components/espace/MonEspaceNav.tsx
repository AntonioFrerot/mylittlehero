"use client";

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
  onSectionChange?: (section: EspaceSection) => void;
};

export function MonEspaceNav({ active, onSectionChange }: MonEspaceNavProps) {
  const { t } = useLocale();
  const items: EspaceSection[] = [...ESPACE_SECTIONS];

  return (
    <nav
      className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none"
      aria-label={t("space.navLabel")}
    >
      {items.map((section) => {
        const isActive = section === active;
        const className = `transition-all ${isActive ? BTN_3D_NAV_ACTIVE : BTN_3D_NAV_INACTIVE}`;

        if (onSectionChange) {
          return (
            <button
              key={section}
              type="button"
              className={className}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSectionChange(section)}
            >
              {t(SECTION_KEYS[section])}
            </button>
          );
        }

        return (
          <a
            key={section}
            href={`/mon-espace?section=${section}`}
            className={className}
            aria-current={isActive ? "page" : undefined}
          >
            {t(SECTION_KEYS[section])}
          </a>
        );
      })}
    </nav>
  );
}
