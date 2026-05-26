export const ESPACE_SECTIONS = ["profil", "personnages", "films"] as const;

export type EspaceSection = (typeof ESPACE_SECTIONS)[number];

export function parseEspaceSection(value: string | undefined): EspaceSection {
  if (value === "films") return "films";
  if (value === "personnages") return "personnages";
  if (value === "profil" || value === "informations") return "profil";
  return "profil";
}

export const ESPACE_SECTION_LABELS: Record<EspaceSection, string> = {
  profil: "Profil",
  personnages: "Les personnages",
  films: "Mes films",
};
