import { themes } from "@/lib/data";
import type { FilmThemeId } from "@/lib/i18n/film-labels";

export type BrowseThemeRow = {
  themeId: FilmThemeId;
  gradient: string;
};

export function getBrowseThemeRows(): BrowseThemeRow[] {
  return themes.map((theme) => ({
    themeId: theme.id as FilmThemeId,
    gradient: theme.gradient,
  }));
}
