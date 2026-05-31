import type { ExampleFilmStyle } from "@/lib/example-films";
import {
  filmDurationBadgeClassName,
  filmStyleBadgeClassName,
  filmThemeBadgeClassName,
} from "@/lib/film-meta-badges";
import type { FilmThemeId } from "@/lib/i18n/film-labels";
import { translateFilmStyle, translateFilmTheme } from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";

type FilmMetaBadgesProps = {
  className?: string;
  style: ExampleFilmStyle;
  styleLabel?: string;
  themes: FilmThemeId[];
  durationLabel: string;
  locale: LocaleCode;
};

export function FilmMetaBadges({
  className = "",
  style,
  styleLabel,
  themes,
  durationLabel,
  locale,
}: FilmMetaBadgesProps) {
  const styleText = styleLabel ?? translateFilmStyle(style, locale);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      <span className={filmStyleBadgeClassName(style)}>{styleText}</span>
      {themes.map((theme) => (
        <span key={theme} className={filmThemeBadgeClassName(theme)}>
          {translateFilmTheme(theme, locale)}
        </span>
      ))}
      <span className={filmDurationBadgeClassName()}>{durationLabel}</span>
    </div>
  );
}
