export const ESPACE_SECTIONS = ["profil", "personnages", "films"] as const;

export type EspaceSection = (typeof ESPACE_SECTIONS)[number];

export const DEFAULT_ESPACE_SECTION: EspaceSection = "films";

export const MON_ESPACE_DEFAULT_PATH = `/mon-espace?section=${DEFAULT_ESPACE_SECTION}`;

export function monEspaceSectionPath(section: EspaceSection = DEFAULT_ESPACE_SECTION) {
  return `/mon-espace?section=${section}`;
}

export function parseEspaceSection(value: string | undefined): EspaceSection {
  if (value === "films") return "films";
  if (value === "personnages") return "personnages";
  if (value === "profil" || value === "informations") return "profil";
  return DEFAULT_ESPACE_SECTION;
}

export const ESPACE_SECTION_LABELS: Record<EspaceSection, string> = {
  profil: "Profil",
  personnages: "Personnages",
  films: "Mes films",
};
