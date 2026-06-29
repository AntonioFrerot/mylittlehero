import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import {
  buildAdminAnalyticsStats,
  getAnalyticsLocale,
  parseAnalyticsPeriod,
} from "@/lib/analytics/admin-stats";
import { listSiteVisitsBetween } from "@/lib/analytics/store";
import { getServerLocale } from "@/lib/i18n/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = parseAnalyticsPeriod(searchParams.get("period"));
  const locale = await getServerLocale();
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
  const stats = buildAdminAnalyticsStats(visits, period, analyticsLocale);

  return NextResponse.json(stats);
}
