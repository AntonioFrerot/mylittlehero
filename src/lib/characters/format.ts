/** Affiche l'âge avec « ans » si l'utilisateur n'a saisi qu'un nombre. */
export function formatCharacterAge(age: string | undefined): string | null {
  if (!age?.trim()) return null;

  const trimmed = age.trim();
  if (/ans/i.test(trimmed)) return trimmed;
  if (/^\d+$/.test(trimmed)) return `${trimmed} ans`;

  return trimmed;
}
