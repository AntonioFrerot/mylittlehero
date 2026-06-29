import { isAdminEmail } from "@/lib/auth/is-admin";
import type { SiteVisit } from "./types";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return LOCAL_HOSTS.has(normalized) || normalized.endsWith(".local");
}

export function shouldRecordVisitEnvironment(hostname: string): boolean {
  if (process.env.NODE_ENV === "development") return false;
  if (isLocalHostname(hostname)) return false;
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false;
  return true;
}

export function isAdminVisit(visit: SiteVisit): boolean {
  return visit.userEmail ? isAdminEmail(visit.userEmail) : false;
}

export function isLikelyLocalVisit(visit: SiteVisit): boolean {
  if (visit.referer?.toLowerCase().includes("localhost")) return true;
  if (!visit.country && !visit.region && !visit.city && !visit.timezone) return true;
  return false;
}

export function filterRealVisitorVisits(visits: SiteVisit[]): SiteVisit[] {
  return visits.filter((visit) => !isAdminVisit(visit) && !isLikelyLocalVisit(visit));
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

export function prepareVisitsForAnalytics(visits: SiteVisit[]): SiteVisit[] {
  return dedupeVisitsByVisitor(filterRealVisitorVisits(visits));
}
