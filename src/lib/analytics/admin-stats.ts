import type {
  AdminAnalyticsStats,
  AnalyticsBucket,
  AnalyticsPeriod,
  RankedCount,
  SiteVisit,
} from "./types";
import { prepareVisitsForAnalytics } from "./filter-visits";

const VISITOR_COOKIE = "mlh_visit_sid";

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
  visits: SiteVisit[],
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

  for (const visit of visits) {
    const start = bucketStartForVisit(visit, period);
    const key = start.toISOString();
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

export function buildAdminAnalyticsStats(
  visits: SiteVisit[],
  period: AnalyticsPeriod,
  locale: string
): AdminAnalyticsStats {
  const realVisits = prepareVisitsForAnalytics(visits);
  const range = getPeriodRange(period);
  const uniqueVisitors = realVisits.length;
  const uniqueUsers = new Set(
    realVisits
      .map((visit) => visit.userEmail)
      .filter((email): email is string => Boolean(email))
  ).size;

  return {
    period,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    totals: {
      pageViews: uniqueVisitors,
      uniqueVisitors,
      uniqueUsers,
      avgPagesPerVisitor: 0,
    },
    series: buildSeries(realVisits, period, range, locale),
    countries: rankByUniqueVisitors(realVisits, (visit) => visit.country),
    cities: rankByUniqueVisitors(realVisits, (visit) => {
      if (!visit.city) return null;
      return visit.region ? `${visit.city} (${visit.region})` : visit.city;
    }, { meta: (visit) => visit.country }),
    regions: rankByUniqueVisitors(realVisits, (visit) => {
      if (!visit.region) return null;
      return visit.country ? `${visit.region} (${visit.country})` : visit.region;
    }),
    pages: rankByUniqueVisitors(realVisits, (visit) => visit.path),
    devices: rankByUniqueVisitors(realVisits, (visit) => visit.deviceType),
    browsers: rankByUniqueVisitors(realVisits, (visit) => visit.browser),
    operatingSystems: rankByUniqueVisitors(realVisits, (visit) => visit.os),
    referrers: rankByUniqueVisitors(
      realVisits,
      (visit) => visit.referer ?? "(direct)"
    ),
    timezones: rankByUniqueVisitors(realVisits, (visit) => visit.timezone),
  };
}

export function parseAnalyticsPeriod(value: string | null | undefined): AnalyticsPeriod {
  if (value === "week" || value === "month" || value === "year") return value;
  return "day";
}

export function getAnalyticsLocale(locale: string): string {
  return locale === "en" ? "en-GB" : "fr-FR";
}

export function formatCountryName(code: string, locale: string): string {
  try {
    const display = new Intl.DisplayNames([getAnalyticsLocale(locale)], {
      type: "region",
    });
    return display.of(code) ?? code;
  } catch {
    return code;
  }
}
