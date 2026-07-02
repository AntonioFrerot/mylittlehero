"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminAnalyticsStats, AnalyticsPeriod } from "@/lib/analytics/types";
import { formatCountryName, formatRevenueEur } from "@/lib/analytics/format";
import { SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";

type AdminAnalyticsDashboardProps = {
  initialPeriod?: AnalyticsPeriod;
};

const EMPTY_STATS: AdminAnalyticsStats = {
  period: "week",
  from: new Date().toISOString(),
  to: new Date().toISOString(),
  totals: {
    pageViews: 0,
    sessions: 0,
    uniqueVisitors: 0,
    uniqueUsers: 0,
    purchases: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    sessionConversionRate: 0,
    checkoutConversionRate: 0,
    bounceRate: 0,
    returningVisitorRate: 0,
    avgPagesPerVisitor: 0,
    avgPagesPerSession: 0,
    checkoutVisitors: 0,
  },
  series: [],
  countries: [],
  cities: [],
  regions: [],
  landingPages: [],
  devices: [],
  browsers: [],
  operatingSystems: [],
  referrers: [],
  timezones: [],
  utmSources: [],
  salesByPlan: [],
  salesBySource: [],
  recentVisits: [],
  funnel: [],
};

const PERIODS: AnalyticsPeriod[] = ["day", "week", "month", "year"];

const DEVICE_LABEL_KEYS = {
  mobile: "admin.analyticsDevice.mobile",
  tablet: "admin.analyticsDevice.tablet",
  desktop: "admin.analyticsDevice.desktop",
  unknown: "admin.analyticsDevice.unknown",
} as const;

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR").format(value);
}

function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatRange(stats: AdminAnalyticsStats, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: stats.period === "day" ? "short" : undefined,
  });
  return `${formatter.format(new Date(stats.from))} → ${formatter.format(new Date(stats.to))}`;
}

function formatVisitDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function VisitsChart({
  series,
  locale,
  emptyLabel,
}: {
  series: AdminAnalyticsStats["series"];
  locale: string;
  emptyLabel: string;
}) {
  const maxViews = Math.max(...series.map((bucket) => bucket.pageViews), 1);
  const chartHeight = 180;

  if (series.every((bucket) => bucket.pageViews === 0)) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-cream/55">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="flex min-w-full items-end gap-1 px-1"
        style={{ minHeight: chartHeight + 48 }}
        role="img"
      >
        {series.map((bucket) => {
          const height = Math.max(6, (bucket.pageViews / maxViews) * chartHeight);
          return (
            <div
              key={bucket.start}
              className="flex min-w-[2.25rem] flex-1 flex-col items-center gap-2"
              title={`${bucket.label}: ${bucket.pageViews} / ${bucket.uniqueVisitors}`}
            >
              <span className="text-[10px] font-medium text-cream/55">
                {bucket.uniqueVisitors > 0 ? bucket.uniqueVisitors : ""}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-gold-dark via-gold to-gold-light/90"
                style={{ height }}
              />
              <span className="max-w-full truncate text-center text-[10px] text-cream/45">
                {bucket.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-cream/45">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-cream">{value}</p>
      {hint ? <p className="mt-1 text-xs text-cream/45">{hint}</p> : null}
    </div>
  );
}

function RankedList({
  title,
  items,
  emptyLabel,
  renderLabel,
  countLabel,
  locale,
}: {
  title: string;
  items: AdminAnalyticsStats["countries"];
  emptyLabel: string;
  renderLabel?: (label: string) => string;
  countLabel: string;
  locale?: string;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-cream/50">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={`${title}-${item.label}-${item.meta ?? ""}`}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0 truncate text-cream/85">
                {renderLabel ? renderLabel(item.label) : item.label}
                {item.meta ? (
                  <span className="ml-1 text-cream/40">({item.meta})</span>
                ) : null}
              </span>
              <span className="shrink-0 text-right text-cream/55">
                {item.count} {countLabel}
                {item.revenue != null && locale ? (
                  <span className="block text-xs text-gold-light/80">
                    {formatRevenueEur(item.revenue, locale)}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminAnalyticsDashboard({
  initialPeriod = "week",
}: AdminAnalyticsDashboardProps = {}) {
  const { locale, t } = useLocale();
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [stats, setStats] = useState<AdminAnalyticsStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (nextPeriod: AnalyticsPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?period=${nextPeriod}`);
      if (!response.ok) throw new Error("fetch_failed");
      const data = (await response.json()) as AdminAnalyticsStats;
      setStats(data);
      setPeriod(nextPeriod);
    } catch {
      setError(t("admin.analyticsLoadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadStats(initialPeriod);
  }, [initialPeriod, loadStats]);

  const periodLabel = useMemo(
    () => ({
      day: t("admin.analyticsPeriodDay"),
      week: t("admin.analyticsPeriodWeek"),
      month: t("admin.analyticsPeriodMonth"),
      year: t("admin.analyticsPeriodYear"),
    }),
    [t]
  );

  return (
    <section className={`${SURFACE_3D_PANEL_LG} space-y-6 p-5 md:p-6`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
            {t("admin.analyticsTitle")}
          </h2>
          <p className="mt-2 text-sm text-cream/60">{t("admin.analyticsLead")}</p>
          <p className="mt-1 text-xs text-cream/45">{formatRange(stats, locale)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((value) => (
            <button
              key={value}
              type="button"
              disabled={loading}
              onClick={() => void loadStats(value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                period === value
                  ? "border-gold/50 bg-gold/15 text-gold-light"
                  : "border-white/10 bg-black/20 text-cream/70 hover:border-white/20 hover:text-cream"
              }`}
            >
              {periodLabel[value]}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("admin.analyticsTotalRevenue")}
          value={formatRevenueEur(stats.totals.totalRevenue, locale)}
          hint={t("admin.analyticsTotalRevenueHint")}
        />
        <StatCard
          label={t("admin.analyticsSessions")}
          value={formatNumber(stats.totals.sessions, locale)}
          hint={t("admin.analyticsSessionsHint")}
        />
        <StatCard
          label={t("admin.analyticsSessionConversionRate")}
          value={`${formatPercent(stats.totals.sessionConversionRate, locale)} %`}
          hint={t("admin.analyticsSessionConversionRateHint")}
        />
        <StatCard
          label={t("admin.analyticsAverageOrderValue")}
          value={formatRevenueEur(stats.totals.averageOrderValue, locale)}
          hint={t("admin.analyticsAverageOrderValueHint")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("admin.analyticsPageViews")}
          value={formatNumber(stats.totals.pageViews, locale)}
          hint={t("admin.analyticsPageViewsHint")}
        />
        <StatCard
          label={t("admin.analyticsUniqueVisitors")}
          value={formatNumber(stats.totals.uniqueVisitors, locale)}
          hint={t("admin.analyticsUniqueVisitorsHint")}
        />
        <StatCard
          label={t("admin.analyticsBounceRate")}
          value={`${formatPercent(stats.totals.bounceRate, locale)} %`}
          hint={t("admin.analyticsBounceRateHint")}
        />
        <StatCard
          label={t("admin.analyticsReturningVisitors")}
          value={`${formatPercent(stats.totals.returningVisitorRate, locale)} %`}
          hint={t("admin.analyticsReturningVisitorsHint")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("admin.analyticsPurchases")}
          value={formatNumber(stats.totals.purchases, locale)}
          hint={t("admin.analyticsPurchasesHint")}
        />
        <StatCard
          label={t("admin.analyticsConversionRate")}
          value={`${formatPercent(stats.totals.conversionRate, locale)} %`}
          hint={t("admin.analyticsConversionRateHint")}
        />
        <StatCard
          label={t("admin.analyticsCheckoutConversionRate")}
          value={`${formatPercent(stats.totals.checkoutConversionRate, locale)} %`}
          hint={t("admin.analyticsCheckoutConversionRateHint")}
        />
        <StatCard
          label={t("admin.analyticsPagesPerSession")}
          value={formatNumber(stats.totals.avgPagesPerSession, locale)}
          hint={t("admin.analyticsPagesPerSessionHint")}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
            {t("admin.analyticsChartTitle")}
          </h3>
          {loading ? (
            <span className="text-xs text-cream/45">{t("admin.analyticsLoading")}</span>
          ) : null}
        </div>
        <VisitsChart
          series={stats.series}
          locale={locale}
          emptyLabel={t("admin.analyticsNoData")}
        />
        <p className="mt-3 text-xs text-cream/40">{t("admin.analyticsChartHint")}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
          {t("admin.analyticsFunnelTitle")}
        </h3>
        <p className="mt-1 text-xs text-cream/45">{t("admin.analyticsFunnelHint")}</p>
        <ul className="mt-4 space-y-3">
          {stats.funnel.map((step) => (
            <li key={step.id}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="text-cream/85">
                  {t(
                    step.labelKey as
                      | "admin.analyticsFunnel.sessions"
                      | "admin.analyticsFunnel.visitors"
                      | "admin.analyticsFunnel.pricing"
                      | "admin.analyticsFunnel.checkout"
                      | "admin.analyticsFunnel.signup"
                      | "admin.analyticsFunnel.account"
                      | "admin.analyticsFunnel.purchase"
                  )}
                </span>
                <span className="shrink-0 text-cream/55">
                  {formatNumber(step.count, locale)} · {formatPercent(step.rateFromVisitors, locale)} %
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
                  style={{ width: `${Math.min(100, step.rateFromVisitors)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
          {t("admin.analyticsSalesBySourceTitle")}
        </h3>
        <p className="mt-1 text-xs text-cream/45">{t("admin.analyticsSalesBySourceHint")}</p>
        {stats.salesBySource.length === 0 ? (
          <p className="mt-4 text-sm text-cream/50">{t("admin.analyticsNoData")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-cream/45">
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsSourceColumn")}</th>
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsSessionsColumn")}</th>
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsOrdersColumn")}</th>
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsRevenueColumn")}</th>
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsSourceConversionColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.salesBySource.map((row) => (
                  <tr key={row.label} className="border-b border-white/5 text-cream/80">
                    <td className="px-2 py-2.5">
                      {row.label === "(direct)" ? t("admin.analyticsDirect") : row.label}
                    </td>
                    <td className="px-2 py-2.5">{formatNumber(row.sessions, locale)}</td>
                    <td className="px-2 py-2.5">{formatNumber(row.purchases, locale)}</td>
                    <td className="px-2 py-2.5">{formatRevenueEur(row.revenue, locale)}</td>
                    <td className="px-2 py-2.5">{formatPercent(row.conversionRate, locale)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
          {t("admin.analyticsRecentTitle")}
        </h3>
        <p className="mt-1 text-xs text-cream/45">{t("admin.analyticsRecentHint")}</p>
        {stats.recentVisits.length === 0 ? (
          <p className="mt-4 text-sm text-cream/50">{t("admin.analyticsNoData")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-cream/45">
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsRecentWhen")}</th>
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsRecentPage")}</th>
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsRecentOrigin")}</th>
                  <th className="px-2 py-2 font-medium">{t("admin.analyticsRecentDevice")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentVisits.map((visit) => {
                  const origin =
                    visit.utmSource ??
                    (visit.referer === "(direct)" || !visit.referer
                      ? t("admin.analyticsDirect")
                      : visit.referer);
                  const geo = visit.city
                    ? visit.country
                      ? `${visit.city}, ${formatCountryName(visit.country, locale)}`
                      : visit.city
                    : visit.country
                      ? formatCountryName(visit.country, locale)
                      : null;

                  return (
                    <tr key={visit.id} className="border-b border-white/5 text-cream/80">
                      <td className="whitespace-nowrap px-2 py-2.5 text-xs text-cream/60">
                        {formatVisitDate(visit.visitedAt, locale)}
                      </td>
                      <td className="px-2 py-2.5">
                        <span className="font-medium text-cream">{visit.path}</span>
                        {visit.userEmail ? (
                          <span className="mt-0.5 block text-xs text-gold-light/80">
                            {t("admin.analyticsRecentLoggedIn")}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-2.5">
                        <span className="block">{origin}</span>
                        {geo ? <span className="text-xs text-cream/45">{geo}</span> : null}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-cream/65">
                        {t(
                          DEVICE_LABEL_KEYS[visit.deviceType] ?? DEVICE_LABEL_KEYS.unknown
                        )}
                        {visit.browser ? ` · ${visit.browser}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankedList
          title={t("admin.analyticsSalesByPlanTitle")}
          items={stats.salesByPlan}
          emptyLabel={t("admin.analyticsNoData")}
          countLabel={t("admin.analyticsOrdersColumn")}
          locale={locale}
        />
        <RankedList
          title={t("admin.analyticsLandingPages")}
          items={stats.landingPages}
          emptyLabel={t("admin.analyticsNoData")}
          countLabel={t("admin.analyticsSessionsColumn")}
        />
        <RankedList
          title={t("admin.analyticsCountries")}
          items={stats.countries}
          emptyLabel={t("admin.analyticsNoData")}
          renderLabel={(label) => formatCountryName(label, locale)}
          countLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsCities")}
          items={stats.cities}
          emptyLabel={t("admin.analyticsNoGeo")}
          countLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsReferrers")}
          items={stats.referrers}
          emptyLabel={t("admin.analyticsNoData")}
          renderLabel={(label) =>
            label === "(direct)" ? t("admin.analyticsDirect") : label
          }
          countLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsUtmSources")}
          items={stats.utmSources}
          emptyLabel={t("admin.analyticsNoData")}
          countLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsDevices")}
          items={stats.devices}
          emptyLabel={t("admin.analyticsNoData")}
          renderLabel={(label) =>
            t(
              DEVICE_LABEL_KEYS[label as keyof typeof DEVICE_LABEL_KEYS] ??
                DEVICE_LABEL_KEYS.unknown
            )
          }
          countLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsBrowsers")}
          items={stats.browsers}
          emptyLabel={t("admin.analyticsNoData")}
          countLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsOperatingSystems")}
          items={stats.operatingSystems}
          emptyLabel={t("admin.analyticsNoData")}
          countLabel={t("admin.analyticsVisitorsShort")}
        />
      </div>
    </section>
  );
}
