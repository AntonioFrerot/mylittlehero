import type { SiteVisit } from "./types";

const SESSION_GAP_MS = 30 * 60 * 1000;

export type VisitorSession = {
  visitorId: string;
  startedAt: string;
  endedAt: string;
  pageViews: SiteVisit[];
  landingPath: string;
  referer: string | null;
  utmSource: string | null;
};

export type SessionMetrics = {
  sessions: number;
  bounceRate: number;
  returningVisitorRate: number;
  checkoutVisitors: number;
  avgPagesPerSession: number;
};

function sortVisitsChronologically(visits: SiteVisit[]): SiteVisit[] {
  return [...visits].sort(
    (a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime()
  );
}

export function buildVisitorSessions(pageViews: SiteVisit[]): VisitorSession[] {
  const sorted = sortVisitsChronologically(pageViews);
  const lastSessionByVisitor = new Map<string, VisitorSession>();
  const sessions: VisitorSession[] = [];

  for (const visit of sorted) {
    const visitTime = new Date(visit.visitedAt).getTime();
    const previous = lastSessionByVisitor.get(visit.visitorId);
    const previousEnd = previous
      ? new Date(previous.endedAt).getTime()
      : Number.NEGATIVE_INFINITY;

    if (previous && visitTime - previousEnd <= SESSION_GAP_MS) {
      previous.pageViews.push(visit);
      previous.endedAt = visit.visitedAt;
      continue;
    }

    const session: VisitorSession = {
      visitorId: visit.visitorId,
      startedAt: visit.visitedAt,
      endedAt: visit.visitedAt,
      pageViews: [visit],
      landingPath: visit.path,
      referer: visit.referer,
      utmSource: visit.utmSource ?? null,
    };
    sessions.push(session);
    lastSessionByVisitor.set(visit.visitorId, session);
  }

  return sessions;
}

function isCheckoutPath(path: string): boolean {
  return (
    path.startsWith("/tarifs") ||
    path.startsWith("/abonnements") ||
    path.startsWith("/achat") ||
    path.startsWith("/creer")
  );
}

export function computeSessionMetrics(
  pageViews: SiteVisit[],
  uniqueVisitors: number
): SessionMetrics {
  const sessions = buildVisitorSessions(pageViews);
  const sessionCount = sessions.length;
  const bouncedSessions = sessions.filter((session) => session.pageViews.length === 1).length;
  const bounceRate =
    sessionCount > 0 ? Math.round((bouncedSessions / sessionCount) * 1000) / 10 : 0;

  const sessionsPerVisitor = new Map<string, number>();
  for (const session of sessions) {
    sessionsPerVisitor.set(
      session.visitorId,
      (sessionsPerVisitor.get(session.visitorId) ?? 0) + 1
    );
  }
  const returningVisitors = [...sessionsPerVisitor.values()].filter((count) => count > 1).length;
  const returningVisitorRate =
    uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 1000) / 10 : 0;

  const checkoutVisitors = new Set(
    pageViews
      .filter((visit) => isCheckoutPath(visit.path))
      .map((visit) => visit.visitorId)
  ).size;

  const totalPagesInSessions = sessions.reduce(
    (sum, session) => sum + session.pageViews.length,
    0
  );
  const avgPagesPerSession =
    sessionCount > 0 ? Math.round((totalPagesInSessions / sessionCount) * 10) / 10 : 0;

  return {
    sessions: sessionCount,
    bounceRate,
    returningVisitorRate,
    checkoutVisitors,
    avgPagesPerSession,
  };
}

export function rankLandingPages(sessions: VisitorSession[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    counts.set(session.landingPath, (counts.get(session.landingPath) ?? 0) + 1);
  }
  return counts;
}
