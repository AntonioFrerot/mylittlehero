export { formatRevenueEur } from "./plan-revenue";

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
