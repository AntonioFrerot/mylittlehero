export type AnalyticsPeriod = "day" | "week" | "month" | "year";

export type SiteVisit = {
  id: string;
  visitedAt: string;
  path: string;
  visitorId: string;
  userEmail: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  locale: string | null;
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
  browser: string | null;
  os: string | null;
  referer: string | null;
  userAgent: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type AnalyticsBucket = {
  label: string;
  start: string;
  pageViews: number;
  uniqueVisitors: number;
};

export type RankedCount = {
  label: string;
  count: number;
  visitors?: number;
  meta?: string | null;
  revenue?: number;
};

export type SalesBySourceRow = {
  label: string;
  sessions: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
};

export type RecentVisitRow = {
  id: string;
  visitedAt: string;
  path: string;
  country: string | null;
  city: string | null;
  deviceType: SiteVisit["deviceType"];
  browser: string | null;
  referer: string | null;
  utmSource: string | null;
  userEmail: string | null;
};

export type ConversionFunnelStep = {
  id: string;
  labelKey: string;
  count: number;
  rateFromVisitors: number;
};

export type AdminAnalyticsStats = {
  period: AnalyticsPeriod;
  from: string;
  to: string;
  totals: {
    pageViews: number;
    sessions: number;
    uniqueVisitors: number;
    uniqueUsers: number;
    purchases: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    sessionConversionRate: number;
    checkoutConversionRate: number;
    bounceRate: number;
    returningVisitorRate: number;
    avgPagesPerVisitor: number;
    avgPagesPerSession: number;
    checkoutVisitors: number;
  };
  series: AnalyticsBucket[];
  countries: RankedCount[];
  cities: RankedCount[];
  regions: RankedCount[];
  pages: RankedCount[];
  landingPages: RankedCount[];
  devices: RankedCount[];
  browsers: RankedCount[];
  operatingSystems: RankedCount[];
  referrers: RankedCount[];
  timezones: RankedCount[];
  utmSources: RankedCount[];
  salesByPlan: RankedCount[];
  salesBySource: SalesBySourceRow[];
  recentVisits: RecentVisitRow[];
  funnel: ConversionFunnelStep[];
};
