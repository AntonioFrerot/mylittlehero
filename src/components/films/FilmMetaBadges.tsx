import type { ExampleFilmStyle } from "@/lib/example-films";
import {
  filmDurationBadgeClassName,
  filmStyleBadgeClassName,
  filmThemeBadgeClassName,
} from "@/lib/film-meta-badges";
import type { FilmThemeId } from "@/lib/i18n/film-labels";
import { translateFilmStyle } from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";

type FilmMetaBadgesProps = {
  className?: string;
  style: ExampleFilmStyle;
  styleLabel?: string;
  theme: FilmThemeId;
  themeLabel: string;
  durationLabel: string;
  locale: LocaleCode;
};

export function FilmMetaBadges({
  className = "",
  style,
  styleLabel,
  theme,
  themeLabel,
  durationLabel,
  locale,
}: FilmMetaBadgesProps) {
  const styleText = styleLabel ?? translateFilmStyle(style, locale);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      <span className={filmStyleBadgeClassName(style)}>{styleText}</span>
      <span className={filmThemeBadgeClassName(theme)}>{themeLabel}</span>
      <span className={filmDurationBadgeClassName()}>{durationLabel}</span>
    </div>
  );
}
