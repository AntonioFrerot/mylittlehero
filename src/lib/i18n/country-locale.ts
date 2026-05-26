import type { LocaleCode } from "./locales";
import { DEFAULT_LOCALE } from "./locales";

const FRENCH_COUNTRIES = new Set([
  "FR",
  "BE",
  "LU",
  "MC",
  "GF",
  "GP",
  "MQ",
  "RE",
  "YT",
  "NC",
  "PF",
  "PM",
  "WF",
  "BL",
  "MF",
]);

const ENGLISH_COUNTRIES = new Set([
  "GB",
  "UK",
  "US",
  "AU",
  "NZ",
  "IE",
  "SG",
  "ZA",
  "IN",
  "PH",
  "NG",
  "KE",
  "JM",
  "TT",
  "BB",
  "BS",
  "BZ",
  "GY",
]);

const SPANISH_COUNTRIES = new Set([
  "ES",
  "MX",
  "AR",
  "CO",
  "CL",
  "PE",
  "VE",
  "EC",
  "GT",
  "CU",
  "BO",
  "DO",
  "HN",
  "PY",
  "SV",
  "NI",
  "CR",
  "PA",
  "UY",
]);

const GERMAN_COUNTRIES = new Set(["DE", "AT", "LI"]);
const ITALIAN_COUNTRIES = new Set(["IT", "SM", "VA"]);
const PORTUGUESE_COUNTRIES = new Set(["PT", "BR", "AO", "MZ", "CV", "GW"]);

export function countryToLocale(country: string | null | undefined): LocaleCode {
  if (!country) return DEFAULT_LOCALE;
  const code = country.toUpperCase();

  if (FRENCH_COUNTRIES.has(code)) return "fr";
  if (ENGLISH_COUNTRIES.has(code)) return "en";
  if (SPANISH_COUNTRIES.has(code)) return "es";
  if (GERMAN_COUNTRIES.has(code)) return "de";
  if (ITALIAN_COUNTRIES.has(code)) return "it";
  if (PORTUGUESE_COUNTRIES.has(code)) return "pt";

  return DEFAULT_LOCALE;
}

export function detectCountryFromHeaders(
  headers: Headers
): string | null {
  return (
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    null
  );
}

export function localeFromAcceptLanguage(
  acceptLanguage: string | null
): LocaleCode | null {
  if (!acceptLanguage) return null;
  const primary = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (primary === "fr") return "fr";
  if (primary === "en") return "en";
  if (primary === "es") return "es";
  if (primary === "de") return "de";
  if (primary === "it") return "it";
  if (primary === "pt") return "pt";
  return null;
}
