import "server-only";

import type {
  AdminAnalyticsStats,
  AnalyticsBucket,
  AnalyticsPeriod,
  ConversionFunnelStep,
  RankedCount,
  RecentVisitRow,
  SalesBySourceRow,
  SiteVisit,
} from "./types";
import {
  preparePageViewsForAnalytics,
  prepareUniqueVisitorsForAnalytics,
} from "./filter-visits";
import { listPurchasesBetween, type PurchaseRecord } from "./purchase-stats";
import {
  buildVisitorSessions,
  computeSessionMetrics,
  rankLandingPages,
} from "./session-stats";
import { VISITOR_COOKIE } from "./constants";
import { getAnalyticsLocale } from "./format";

export { VISITOR_COOKIE };

type PeriodRange = {
  from: Date;
  to: Date;
  bucketMs: number;
  bucketLabel: (date: Date, locale: string) => string;
};

function startOfHour(date: Date): Date {
  const copy = new Date(date);
  copy.setMinutes(0, 0, 0);
  return copy;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(date: Date): Date {
  const copy = new Date(date);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getPeriodRange(period: AnalyticsPeriod, now = new Date()): PeriodRange {
  const to = now;

  if (period === "day") {
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return {
      from,
      to,
      bucketMs: 60 * 60 * 1000,
      bucketLabel: (date, locale) =>
        new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
          date
        ),
    };
  }

  if (period === "week") {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      from,
      to,
      bucketMs: 24 * 60 * 60 * 1000,
      bucketLabel: (date, locale) =>
        new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).format(
          date
        ),
    };
  }

  if (period === "month") {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      from,
      to,
      bucketMs: 24 * 60 * 60 * 1000,
      bucketLabel: (date, locale) =>
        new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
          date
        ),
    };
  }

  const from = new Date(now);
  from.setFullYear(from.getFullYear() - 1);
  from.setDate(1);
  from.setHours(0, 0, 0, 0);

  return {
    from,
    to,
    bucketMs: 30 * 24 * 60 * 60 * 1000,
    bucketLabel: (date, locale) =>
      new Intl.DateTimeFormat(locale, { month: "short", year: "2-digit" }).format(date),
  };
}

function bucketStartForVisit(visit: SiteVisit, period: AnalyticsPeriod): Date {
  const date = new Date(visit.visitedAt);
  if (period === "day") return startOfHour(date);
  if (period === "year") return startOfMonth(date);
  return startOfDay(date);
}

function buildSeries(
  pageViews: SiteVisit[],
  uniqueVisits: SiteVisit[],
  period: AnalyticsPeriod,
  range: PeriodRange,
  locale: string
): AnalyticsBucket[] {
  const buckets = new Map<string, AnalyticsBucket>();

  if (period === "year") {
    const cursor = startOfMonth(range.from);
    while (cursor <= range.to) {
      const key = cursor.toISOString();
      buckets.set(key, {
        label: range.bucketLabel(cursor, locale),
        start: key,
        pageViews: 0,
        uniqueVisitors: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    const cursor = new Date(
      period === "day" ? startOfHour(range.from) : startOfDay(range.from)
    );
    while (cursor <= range.to) {
      const key = cursor.toISOString();
      buckets.set(key, {
        label: range.bucketLabel(cursor, locale),
        start: key,
        pageViews: 0,
        uniqueVisitors: 0,
      });
      cursor.setTime(cursor.getTime() + range.bucketMs);
    }
  }

  const visitorsByBucket = new Map<string, Set<string>>();

  for (const visit of pageViews) {
    const key = bucketStartForVisit(visit, period).toISOString();
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.pageViews += 1;
  }

  for (const visit of uniqueVisits) {
    const key = bucketStartForVisit(visit, period).toISOString();
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const visitors = visitorsByBucket.get(key) ?? new Set<string>();
    if (visitors.has(visit.visitorId)) continue;
    visitors.add(visit.visitorId);
    visitorsByBucket.set(key, visitors);
    bucket.uniqueVisitors = visitors.size;
  }

  return [...buckets.values()];
}

function rankByUniqueVisitors(
  visits: SiteVisit[],
  getLabel: (visit: SiteVisit) => string | null,
  options?: { meta?: (visit: SiteVisit) => string | null }
): RankedCount[] {
  const counts = new Map<string, { visitors: Set<string>; meta: string | null }>();

  for (const visit of visits) {
    const label = getLabel(visit);
    if (!label) continue;
    const existing = counts.get(label) ?? {
      visitors: new Set<string>(),
      meta: options?.meta?.(visit) ?? null,
    };
    existing.visitors.add(visit.visitorId);
    counts.set(label, existing);
  }

  return [...counts.entries()]
    .map(([label, value]) => ({
      label,
      count: value.visitors.size,
      meta: value.meta,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function buildRecentVisits(pageViews: SiteVisit[]): RecentVisitRow[] {
  return [...pageViews]
    .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
    .slice(0, 40)
    .map((visit) => ({
      id: visit.id,
      visitedAt: visit.visitedAt,
      path: visit.path,
      country: visit.country,
      city: visit.city,
      deviceType: visit.deviceType,
      browser: visit.browser,
      referer: visit.referer,
      utmSource: visit.utmSource ?? null,
      userEmail: visit.userEmail,
    }));
}

function buildSalesByPlan(purchases: PurchaseRecord[]): RankedCount[] {
  const counts = new Map<string, { orders: number; revenue: number }>();

  for (const purchase of purchases) {
    const existing = counts.get(purchase.planId) ?? { orders: 0, revenue: 0 };
    existing.orders += 1;
    existing.revenue += purchase.revenueEur;
    counts.set(purchase.planId, existing);
  }

  return [...counts.entries()]
    .map(([label, value]) => ({
      label,
      count: value.orders,
      revenue: Math.round(value.revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 12);
}

function attributeSourceLabel(visit: SiteVisit): string {
  if (visit.utmSource) return visit.utmSource;
  if (!visit.referer || visit.referer === "(direct)") return "(direct)";
  return visit.referer;
}

function buildSalesBySource(
  pageViews: SiteVisit[],
  purchases: PurchaseRecord[]
): SalesBySourceRow[] {
  const sessions = buildVisitorSessions(pageViews);
  const sessionsBySource = new Map<string, number>();

  for (const session of sessions) {
    const label = attributeSourceLabel({
      referer: session.referer,
      utmSource: session.utmSource,
    } as SiteVisit);
    sessionsBySource.set(label, (sessionsBySource.get(label) ?? 0) + 1);
  }

  const purchasesBySource = new Map<string, { count: number; revenue: number }>();

  for (const purchase of purchases) {
    const userVisits = pageViews
      .filter((visit) => visit.userEmail === purchase.userEmail)
      .sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime());
    const lastVisitBeforePurchase =
      [...userVisits]
        .reverse()
        .find(
          (visit) =>
            new Date(visit.visitedAt).getTime() <= new Date(purchase.createdAt).getTime()
        ) ?? userVisits[0];

    const label = lastVisitBeforePurchase
      ? attributeSourceLabel(lastVisitBeforePurchase)
      : "(direct)";

    const existing = purchasesBySource.get(label) ?? { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += purchase.revenueEur;
    purchasesBySource.set(label, existing);
  }

  const labels = new Set([
    ...sessionsBySource.keys(),
    ...purchasesBySource.keys(),
  ]);

  return [...labels]
    .map((label) => {
      const sessionCount = sessionsBySource.get(label) ?? 0;
      const purchaseStats = purchasesBySource.get(label) ?? { count: 0, revenue: 0 };
      return {
        label,
        sessions: sessionCount,
        purchases: purchaseStats.count,
        revenue: Math.round(purchaseStats.revenue * 100) / 100,
        conversionRate:
          sessionCount > 0
            ? Math.round((purchaseStats.count / sessionCount) * 1000) / 10
            : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.sessions - a.sessions)
    .slice(0, 12);
}

function buildLandingPageRanking(sessions: ReturnType<typeof buildVisitorSessions>): RankedCount[] {
  const counts = rankLandingPages(sessions);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function buildFunnel(
  sessions: number,
  uniqueVisitors: number,
  pageViews: SiteVisit[],
  purchases: number,
  checkoutVisitors: number
): ConversionFunnelStep[] {
  const pricingVisitors = new Set(
    pageViews
      .filter((visit) => visit.path.startsWith("/tarifs") || visit.path.startsWith("/abonnements") || visit.path.startsWith("/achat"))
      .map((visit) => visit.visitorId)
  ).size;
  const signupVisitors = new Set(
    pageViews
      .filter((visit) => visit.path.startsWith("/inscription") || visit.path.startsWith("/connexion"))
      .map((visit) => visit.visitorId)
  ).size;
  const accountVisitors = new Set(
    pageViews
      .filter((visit) => visit.path.startsWith("/mon-espace") || visit.path.startsWith("/creer-film"))
      .map((visit) => visit.visitorId)
  ).size;

  const rateFromSessions = (count: number) =>
    sessions > 0 ? Math.round((count / sessions) * 1000) / 10 : 0;

  return [
    {
      id: "sessions",
      labelKey: "admin.analyticsFunnel.sessions",
      count: sessions,
      rateFromVisitors: sessions > 0 ? 100 : 0,
    },
    {
      id: "visitors",
      labelKey: "admin.analyticsFunnel.visitors",
      count: uniqueVisitors,
      rateFromVisitors:
        sessions > 0 ? Math.round((uniqueVisitors / sessions) * 1000) / 10 : 0,
    },
    {
      id: "pricing",
      labelKey: "admin.analyticsFunnel.pricing",
      count: pricingVisitors,
      rateFromVisitors: rateFromSessions(pricingVisitors),
    },
    {
      id: "checkout",
      labelKey: "admin.analyticsFunnel.checkout",
      count: checkoutVisitors,
      rateFromVisitors: rateFromSessions(checkoutVisitors),
    },
    {
      id: "signup",
      labelKey: "admin.analyticsFunnel.signup",
      count: signupVisitors,
      rateFromVisitors: rateFromSessions(signupVisitors),
    },
    {
      id: "account",
      labelKey: "admin.analyticsFunnel.account",
      count: accountVisitors,
      rateFromVisitors: rateFromSessions(accountVisitors),
    },
    {
      id: "purchase",
      labelKey: "admin.analyticsFunnel.purchase",
      count: purchases,
      rateFromVisitors: rateFromSessions(purchases),
    },
  ];
}

export async function buildAdminAnalyticsStats(
  visits: SiteVisit[],
  period: AnalyticsPeriod,
  locale: string
): Promise<AdminAnalyticsStats> {
  const pageViews = preparePageViewsForAnalytics(visits);
  const uniqueVisits = prepareUniqueVisitorsForAnalytics(visits);
  const range = getPeriodRange(period);
  const uniqueVisitors = uniqueVisits.length;
  const totalPageViews = pageViews.length;
  const uniqueUsers = new Set(
    uniqueVisits
      .map((visit) => visit.userEmail)
      .filter((email): email is string => Boolean(email))
  ).size;
  const purchasesStats = await listPurchasesBetween(range.from, range.to);
  const purchases = purchasesStats.purchases.length;
  const sessionMetrics = computeSessionMetrics(pageViews, uniqueVisitors);
  const visitorSessions = buildVisitorSessions(pageViews);

  const conversionRate =
    uniqueVisitors > 0 ? Math.round((purchases / uniqueVisitors) * 1000) / 10 : 0;
  const sessionConversionRate =
    sessionMetrics.sessions > 0
      ? Math.round((purchases / sessionMetrics.sessions) * 1000) / 10
      : 0;
  const checkoutConversionRate =
    sessionMetrics.checkoutVisitors > 0
      ? Math.round((purchases / sessionMetrics.checkoutVisitors) * 1000) / 10
      : 0;

  return {
    period,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    totals: {
      pageViews: totalPageViews,
      sessions: sessionMetrics.sessions,
      uniqueVisitors,
      uniqueUsers,
      purchases,
      totalRevenue: purchasesStats.totalRevenue,
      averageOrderValue: purchasesStats.averageOrderValue,
      conversionRate,
      sessionConversionRate,
      checkoutConversionRate,
      bounceRate: sessionMetrics.bounceRate,
      returningVisitorRate: sessionMetrics.returningVisitorRate,
      avgPagesPerVisitor:
        uniqueVisitors > 0
          ? Math.round((totalPageViews / uniqueVisitors) * 10) / 10
          : 0,
      avgPagesPerSession: sessionMetrics.avgPagesPerSession,
      checkoutVisitors: sessionMetrics.checkoutVisitors,
    },
    series: buildSeries(pageViews, uniqueVisits, period, range, locale),
    countries: rankByUniqueVisitors(uniqueVisits, (visit) => visit.country),
    cities: rankByUniqueVisitors(uniqueVisits, (visit) => {
      if (!visit.city) return null;
      return visit.region ? `${visit.city} (${visit.region})` : visit.city;
    }, { meta: (visit) => visit.country }),
    regions: rankByUniqueVisitors(uniqueVisits, (visit) => {
      if (!visit.region) return null;
      return visit.country ? `${visit.region} (${visit.country})` : visit.region;
    }),
    landingPages: buildLandingPageRanking(visitorSessions),
    devices: rankByUniqueVisitors(uniqueVisits, (visit) => visit.deviceType),
    browsers: rankByUniqueVisitors(uniqueVisits, (visit) => visit.browser),
    operatingSystems: rankByUniqueVisitors(uniqueVisits, (visit) => visit.os),
    referrers: rankByUniqueVisitors(
      uniqueVisits,
      (visit) => visit.referer ?? "(direct)"
    ),
    timezones: rankByUniqueVisitors(uniqueVisits, (visit) => visit.timezone),
    utmSources: rankByUniqueVisitors(uniqueVisits, (visit) => visit.utmSource ?? null),
    salesByPlan: buildSalesByPlan(purchasesStats.purchases),
    salesBySource: buildSalesBySource(pageViews, purchasesStats.purchases),
    recentVisits: buildRecentVisits(pageViews),
    funnel: buildFunnel(
      sessionMetrics.sessions,
      uniqueVisitors,
      pageViews,
      purchases,
      sessionMetrics.checkoutVisitors
    ),
  };
}

export function parseAnalyticsPeriod(value: string | null | undefined): AnalyticsPeriod {
  if (value === "week" || value === "month" || value === "year") return value;
  return "day";
}

export { getAnalyticsLocale } from "./format";
