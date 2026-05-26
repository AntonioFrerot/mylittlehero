"use client";

import Link from "next/link";
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
            className={`shrink-0 snap-start rounded-xl px-4 py-3 text-sm font-medium transition-all lg:shrink lg:text-base ${
              isActive
                ? "bg-gradient-to-r from-gold-dark/90 via-gold/80 to-gold-light/90 text-cinema-black shadow-glow-gold-subtle"
                : "border border-white/10 bg-cinema-night/50 text-cream/70 hover:border-white/20 hover:text-cream"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {t(SECTION_KEYS[section])}
          </Link>
        );
      })}
    </nav>
  );
}
