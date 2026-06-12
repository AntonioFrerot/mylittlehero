/** Une adresse = un compte (minuscules, espaces retirés). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > 254) return false;

  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return false;

  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (!local || !domain || !domain.includes(".")) return false;
  if (local.startsWith(".") || local.endsWith(".")) return false;

  return true;
}
