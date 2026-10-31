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

function localSegmentLooksHuman(segment: string): boolean {
  if (!segment) return false;
  if (/^\d+$/.test(segment)) return true;
  if (segment.length === 1) return false;
  if (segment.length <= 2) return /[aeiouy]/.test(segment);
  if (!/[aeiouy]/.test(segment)) return false;
  if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(segment)) return false;
  return true;
}

/** Heuristique anti-bots (local part aléatoire, points, suites sans voyelles). */
function looksLikeGarbageLocalPart(local: string): boolean {
  const dotCount = (local.match(/\./g) ?? []).length;
  const segments = local.split(".").filter(Boolean);

  const singleLetterSegments = segments.filter(
    (segment) => segment.length === 1 && /^[a-z]$/.test(segment)
  ).length;
  if (singleLetterSegments >= 3) return true;

  if (segments.length >= 5) {
    const averageLength =
      segments.reduce((sum, segment) => sum + segment.length, 0) / segments.length;
    if (averageLength < 3) return true;
  }

  if (dotCount >= 2 && segments.length >= 3) {
    const humanSegments = segments.filter(localSegmentLooksHuman).length;
    if (humanSegments < 2) return true;
    if (segments.length >= 4 && humanSegments / segments.length < 0.5) {
      return true;
    }
  }

  if (dotCount >= 2 && segments.length === 2) {
    if (!segments.every(localSegmentLooksHuman)) return true;
  }

  if (dotCount >= 3 && local.length >= 10) {
    const lettersOnly = local.replace(/[^a-z]/g, "");
    const vowels = (lettersOnly.match(/[aeiouy]/g) ?? []).length;
    if (lettersOnly.length >= 8 && vowels / lettersOnly.length < 0.2) {
      return true;
    }
  }

  if (/^[a-z0-9]+$/.test(local) && local.length >= 28) {
    return true;
  }

  const digitCount = (local.match(/\d/g) ?? []).length;
  if (local.length >= 16 && digitCount / local.length >= 0.45) {
    return true;
  }

  const lettersOnly = local.replace(/[^a-z]/g, "");
  if (lettersOnly.length >= 14 && !/[aeiouy]/.test(lettersOnly)) {
    return true;
  }

  if (lettersOnly.length >= 18) {
    const vowels = (lettersOnly.match(/[aeiouy]/g) ?? []).length;
    if (vowels / lettersOnly.length < 0.22) {
      return true;
    }
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
