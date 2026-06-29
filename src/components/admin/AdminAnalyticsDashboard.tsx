"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminAnalyticsStats, AnalyticsPeriod } from "@/lib/analytics/types";
import { formatCountryName } from "@/lib/analytics/admin-stats";
import { SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";

type AdminAnalyticsDashboardProps = {
  initialStats: AdminAnalyticsStats;
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

function formatRange(stats: AdminAnalyticsStats, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: stats.period === "day" ? "short" : undefined,
  });
  return `${formatter.format(new Date(stats.from))} → ${formatter.format(new Date(stats.to))}`;
}

function VisitsChart({
  series,
  locale,
  emptyLabel,
  visitorsLabel,
}: {
  series: AdminAnalyticsStats["series"];
  locale: string;
  emptyLabel: string;
  visitorsLabel: string;
}) {
  const maxVisitors = Math.max(...series.map((bucket) => bucket.uniqueVisitors), 1);
  const chartHeight = 180;
  const barGap = 4;

  if (series.every((bucket) => bucket.uniqueVisitors === 0)) {
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
        aria-label={visitorsLabel}
      >
        {series.map((bucket) => {
          const height = Math.max(6, (bucket.uniqueVisitors / maxVisitors) * chartHeight);
          return (
            <div
              key={bucket.start}
              className="flex min-w-[2.25rem] flex-1 flex-col items-center gap-2"
              title={`${bucket.label}: ${bucket.uniqueVisitors}`}
            >
              <span className="text-[10px] font-medium text-cream/55">
                {bucket.uniqueVisitors > 0 ? bucket.uniqueVisitors : ""}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-gold-dark via-gold to-gold-light/90"
                style={{ height, marginBottom: barGap }}
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
  visitorsLabel,
}: {
  title: string;
  items: AdminAnalyticsStats["countries"];
  emptyLabel: string;
  renderLabel?: (label: string) => string;
  visitorsLabel: string;
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
              <span className="shrink-0 text-cream/55">
                {item.count} {visitorsLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminAnalyticsDashboard({ initialStats }: AdminAnalyticsDashboardProps) {
  const { locale, t } = useLocale();
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialStats.period);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
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
    if (period === initialStats.period) {
      setStats(initialStats);
    }
  }, [initialStats, period]);

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

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label={t("admin.analyticsUniqueVisitors")}
          value={formatNumber(stats.totals.uniqueVisitors, locale)}
          hint={t("admin.analyticsUniqueVisitorsHint")}
        />
        <StatCard
          label={t("admin.analyticsUniqueUsers")}
          value={formatNumber(stats.totals.uniqueUsers, locale)}
          hint={t("admin.analyticsUniqueUsersHint")}
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
          visitorsLabel={t("admin.analyticsChartTitle")}
        />
        <p className="mt-3 text-xs text-cream/40">{t("admin.analyticsChartHint")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankedList
          title={t("admin.analyticsCountries")}
          items={stats.countries}
          emptyLabel={t("admin.analyticsNoData")}
          renderLabel={(label) => formatCountryName(label, locale)}
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsCities")}
          items={stats.cities}
          emptyLabel={t("admin.analyticsNoGeo")}
          renderLabel={(label) => label}
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsRegions")}
          items={stats.regions}
          emptyLabel={t("admin.analyticsNoGeo")}
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsTimezones")}
          items={stats.timezones}
          emptyLabel={t("admin.analyticsNoGeo")}
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsPages")}
          items={stats.pages}
          emptyLabel={t("admin.analyticsNoData")}
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsReferrers")}
          items={stats.referrers}
          emptyLabel={t("admin.analyticsNoData")}
          renderLabel={(label) =>
            label === "(direct)" ? t("admin.analyticsDirect") : label
          }
          visitorsLabel={t("admin.analyticsVisitorsShort")}
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
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsBrowsers")}
          items={stats.browsers}
          emptyLabel={t("admin.analyticsNoData")}
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
        <RankedList
          title={t("admin.analyticsOperatingSystems")}
          items={stats.operatingSystems}
          emptyLabel={t("admin.analyticsNoData")}
          visitorsLabel={t("admin.analyticsVisitorsShort")}
        />
      </div>
    </section>
  );
}
