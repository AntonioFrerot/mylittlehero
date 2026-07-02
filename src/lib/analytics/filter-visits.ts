import { isAdminEmail } from "@/lib/auth/is-admin";
import type { SiteVisit } from "./types";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

const NOISE_PATHS = new Set([
  "/icon.png",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

export function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return LOCAL_HOSTS.has(normalized) || normalized.endsWith(".local");
}

export function isLocalAnalyticsEnabled(): boolean {
  return process.env.ANALYTICS_RECORD_LOCAL === "1";
}

export function shouldRecordVisitEnvironment(hostname: string): boolean {
  if (isLocalHostname(hostname)) return isLocalAnalyticsEnabled();
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false;
  return true;
}

export function isNoiseVisitPath(path: string): boolean {
  const normalized = path.split("?")[0]?.toLowerCase() ?? "";
  if (NOISE_PATHS.has(normalized)) return true;
  if (normalized.startsWith("/_next/")) return true;
  return false;
}

export function isAdminVisit(visit: SiteVisit): boolean {
  return visit.userEmail ? isAdminEmail(visit.userEmail) : false;
}

export function isLikelyLocalVisit(visit: SiteVisit): boolean {
  if (!isLocalAnalyticsEnabled()) {
    const referer = visit.referer?.toLowerCase() ?? "";
    if (referer.includes("localhost") || referer.includes("127.0.0.1")) return true;
  }
  return false;
}

export function filterRealVisitorVisits(visits: SiteVisit[]): SiteVisit[] {
  return visits.filter(
    (visit) =>
      !isAdminVisit(visit) &&
      !isLikelyLocalVisit(visit) &&
      !isNoiseVisitPath(visit.path)
  );
}

/** Un seul enregistrement par visiteur (première visite de la période). */
export function dedupeVisitsByVisitor(visits: SiteVisit[]): SiteVisit[] {
  const firstByVisitor = new Map<string, SiteVisit>();

  for (const visit of visits) {
    const existing = firstByVisitor.get(visit.visitorId);
    if (!existing || new Date(visit.visitedAt) < new Date(existing.visitedAt)) {
      firstByVisitor.set(visit.visitorId, visit);
    }
  }

  return [...firstByVisitor.values()].sort(
    (a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime()
  );
}

export function preparePageViewsForAnalytics(visits: SiteVisit[]): SiteVisit[] {
  return filterRealVisitorVisits(visits);
}

export function prepareUniqueVisitorsForAnalytics(visits: SiteVisit[]): SiteVisit[] {
  return dedupeVisitsByVisitor(filterRealVisitorVisits(visits));
}

/** @deprecated Utiliser prepareUniqueVisitorsForAnalytics */
export function prepareVisitsForAnalytics(visits: SiteVisit[]): SiteVisit[] {
  return prepareUniqueVisitorsForAnalytics(visits);
}
