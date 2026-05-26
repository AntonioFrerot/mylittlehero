"use client";

import type { TranslationKey } from "@/lib/i18n/translator";

type ThemeCardProps = {
  id: string;
  gradient: string;
  title: string;
  description: string;
};

export function ThemeCard({
  id,
  gradient,
  title,
  description,
}: ThemeCardProps) {
  return (
    <article
      data-theme={id}
      className={`theme-card group relative flex h-[8.75rem] w-full flex-col overflow-hidden rounded-[1.25rem] md:h-[9.5rem] ${gradient}`}
    >
      <span className="theme-card__orb" aria-hidden />
      <span className="theme-card__sheen" aria-hidden />
      <span className="theme-card__vignette" aria-hidden />
      <span className="theme-card__grain" aria-hidden />

      <div className="theme-card__body relative z-[1] p-4 md:p-5">
        <div className="theme-card__title-row">
          <span className="theme-card__mark" aria-hidden />
          <h3 className="font-display text-lg font-semibold leading-none tracking-tight text-cream md:text-xl">
            {title}
          </h3>
        </div>
        <p className="theme-card__desc line-clamp-2 text-xs leading-snug md:text-sm md:leading-snug">
          {description}
        </p>
      </div>
    </article>
  );
}

export function themeNameKey(id: string): TranslationKey {
  return `themes.${id}` as TranslationKey;
}

export function themeDescKey(id: string): TranslationKey {
  return `themes.${id}Desc` as TranslationKey;
}
