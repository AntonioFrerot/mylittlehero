/** Ancre accueil — films d’exemple (évite la confusion avec la route `/catalogue`). */
export const HOME_FILMS_EXEMPLES_SECTION_ID = "films-exemples";

export const HOME_FILMS_EXEMPLES_HREF = `/#${HOME_FILMS_EXEMPLES_SECTION_ID}`;

const HOME_SECTION_ID_ALIASES: Record<string, string> = {
  catalogue: HOME_FILMS_EXEMPLES_SECTION_ID,
};

export function resolveHomeSectionId(id: string): string {
  return HOME_SECTION_ID_ALIASES[id] ?? id;
}
