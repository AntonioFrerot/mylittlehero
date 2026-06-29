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
};

export type AdminAnalyticsStats = {
  period: AnalyticsPeriod;
  from: string;
  to: string;
  totals: {
    pageViews: number;
    uniqueVisitors: number;
    uniqueUsers: number;
    avgPagesPerVisitor: number;
  };
  series: AnalyticsBucket[];
  countries: RankedCount[];
  cities: RankedCount[];
  regions: RankedCount[];
  pages: RankedCount[];
  devices: RankedCount[];
  browsers: RankedCount[];
  operatingSystems: RankedCount[];
  referrers: RankedCount[];
  timezones: RankedCount[];
};
