import { parseLocale } from "@/lib/i18n/locales";
import type { SiteVisit } from "./types";

export type ParsedVisitInput = {
  path: string;
  search?: string | null;
  visitorId: string;
  userEmail?: string | null;
  headers: Headers;
};

function parseDeviceType(userAgent: string | null): SiteVisit["deviceType"] {
  if (!userAgent) return "unknown";
  if (/ipad|tablet|kindle|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(userAgent)) {
    return "mobile";
  }
  if (userAgent) return "desktop";
  return "unknown";
}

function parseBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  return "Autre";
}

function parseOs(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/windows nt/i.test(userAgent)) return "Windows";
  if (/mac os x/i.test(userAgent) && !/iphone|ipad|ipod/i.test(userAgent)) return "macOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Autre";
}

function parseReferer(referer: string | null): string | null {
  if (!referer?.trim()) return null;
  try {
    const url = new URL(referer);
    if (url.hostname === "localhost" || url.hostname.endsWith(".vercel.app")) {
      return url.hostname;
    }
    return url.hostname.replace(/^www\./, "");
  } catch {
    return referer.slice(0, 200);
  }
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function shouldTrackVisit(pathname: string, userAgent: string | null): boolean {
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/api")) return false;
  if (/\.(png|jpe?g|webp|gif|svg|ico|woff2?|css|js|map)$/i.test(pathname)) return false;
  if (/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram/i.test(
    userAgent ?? ""
  )) {
    return false;
  }
  return true;
}

function parseUtm(search: string | null | undefined): {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
} {
  if (!search?.trim()) {
    return { utmSource: null, utmMedium: null, utmCampaign: null };
  }

  try {
    const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
    const pick = (key: string) => params.get(key)?.trim().slice(0, 120) ?? null;
    return {
      utmSource: pick("utm_source"),
      utmMedium: pick("utm_medium"),
      utmCampaign: pick("utm_campaign"),
    };
  } catch {
    return { utmSource: null, utmMedium: null, utmCampaign: null };
  }
}

export function parseVisitFromRequest(input: ParsedVisitInput): Omit<
  SiteVisit,
  "id" | "visitedAt"
> {
  const headers = input.headers;
  const userAgent = headers.get("user-agent");
  const localeCookie = headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("mlh_locale="))
    ?.split("=")[1];
  const locale = parseLocale(localeCookie ? decodeURIComponent(localeCookie) : null);
  const utm = parseUtm(input.search);

  return {
    path: input.path.slice(0, 500),
    visitorId: input.visitorId.slice(0, 64),
    userEmail: input.userEmail ?? null,
    country:
      headers.get("x-vercel-ip-country")?.toUpperCase() ??
      headers.get("cf-ipcountry")?.toUpperCase() ??
      null,
    region: headers.get("x-vercel-ip-country-region") ?? null,
    city: headers.get("x-vercel-ip-city") ?? null,
    timezone: headers.get("x-vercel-ip-timezone") ?? null,
    latitude: parseNumber(headers.get("x-vercel-ip-latitude")),
    longitude: parseNumber(headers.get("x-vercel-ip-longitude")),
    locale,
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOs(userAgent),
    referer: parseReferer(headers.get("referer")),
    userAgent: userAgent?.slice(0, 500) ?? null,
    utmSource: utm.utmSource,
    utmMedium: utm.utmMedium,
    utmCampaign: utm.utmCampaign,
  };
}
