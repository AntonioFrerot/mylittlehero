export const CANONICAL_SITE_HOST = "formylittlehero.com";
export const CANONICAL_SITE_ORIGIN = `https://${CANONICAL_SITE_HOST}`;

function normalizeOrigin(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return CANONICAL_SITE_ORIGIN;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return withProtocol.replace(/\/$/, "");
}

export function isAlternateDeploymentHost(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0];
  if (!host) return false;
  if (host === CANONICAL_SITE_HOST || host === `www.${CANONICAL_SITE_HOST}`) {
    return false;
  }
  return host.endsWith(".vercel.app");
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return normalizeOrigin(explicit);
  }

  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_ORIGIN;
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return normalizeOrigin(productionHost);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return normalizeOrigin(vercel);
  }

  return "http://localhost:3000";
}

/** Chemins internes relatifs ; URLs *.vercel.app converties en chemin relatif. */
export function normalizeSiteHref(href: string, fallback = "/mon-espace?section=films"): string {
  const trimmed = href.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/")) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (isAlternateDeploymentHost(url.hostname)) {
        const path = `${url.pathname}${url.search}${url.hash}`;
        return path || "/";
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, "")}`;
}

export function toAbsoluteSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    const normalized = normalizeSiteHref(path, path);
    if (normalized.startsWith("/")) {
      return `${getSiteUrl()}${normalized}`;
    }
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
