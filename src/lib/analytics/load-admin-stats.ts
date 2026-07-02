import {
  buildAdminAnalyticsStats,
  getAnalyticsLocale,
} from "@/lib/analytics/admin-stats";
import { listSiteVisitsBetween } from "@/lib/analytics/store";
import type { AdminAnalyticsStats } from "@/lib/analytics/types";

export async function loadAdminAnalyticsStats(
  locale: string,
  period: AdminAnalyticsStats["period"] = "week"
): Promise<AdminAnalyticsStats> {
  const analyticsLocale = getAnalyticsLocale(locale);
  const now = new Date();
  const from = new Date(
    period === "day"
      ? now.getTime() - 24 * 60 * 60 * 1000
      : period === "week"
        ? now.getTime() - 7 * 24 * 60 * 60 * 1000
        : period === "month"
          ? now.getTime() - 30 * 24 * 60 * 60 * 1000
          : (() => {
              const start = new Date(now);
              start.setFullYear(start.getFullYear() - 1);
              return start.getTime();
            })()
  );

  const visits = await listSiteVisitsBetween(from, now);
  return await buildAdminAnalyticsStats(visits, period, analyticsLocale);
}
