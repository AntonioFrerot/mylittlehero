/** Une adresse = un compte (minuscules, espaces retirés). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const LOCAL_PART_MAX = 64;
const EMAIL_MAX = 254;

/** Local : lettres/chiffres et . _ % + - (pas de doubles points). */
const LOCAL_PART_RE = /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?$/;

const DOMAIN_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "getnada.com",
  "sharklasers.com",
  "trashmail.com",
]);

function domainLabels(domain: string): string[] {
  return domain.split(".").filter(Boolean);
}

function hasValidTld(domain: string): boolean {
  const tld = domainLabels(domain).pop() ?? "";
  return /^[a-z]{2,63}$/.test(tld);
}

/** Heuristique anti-bots (local part très longue / aléatoire). */
function looksLikeGarbageLocalPart(local: string): boolean {
  if (local.length <= 24) return false;

  if (/^[a-z0-9]+$/.test(local) && local.length >= 28) {
    return true;
  }

  const digitCount = (local.match(/\d/g) ?? []).length;
  if (local.length >= 16 && digitCount / local.length >= 0.45) {
    return true;
  }

  if (local.length >= 14 && !/[aeiouy]/.test(local)) {
    return true;
  }

  return false;
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > EMAIL_MAX) return false;

  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return false;

  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);

  if (!local || local.length > LOCAL_PART_MAX) return false;
  if (!domain || domain.length > 253) return false;
  if (local.includes("..") || domain.includes("..")) return false;
  if (!LOCAL_PART_RE.test(local)) return false;
  if (looksLikeGarbageLocalPart(local)) return false;

  const labels = domainLabels(domain);
  if (labels.length < 2) return false;
  if (!labels.every((label) => DOMAIN_LABEL_RE.test(label))) return false;
  if (!hasValidTld(domain)) return false;

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return false;

  return true;
}
