export const LOCALES = [
  { code: "fr", label: "Français", nativeLabel: "Français" },
  { code: "en", label: "Anglais", nativeLabel: "English" },
  { code: "es", label: "Espagnol", nativeLabel: "Español" },
  { code: "de", label: "Allemand", nativeLabel: "Deutsch" },
  { code: "it", label: "Italien", nativeLabel: "Italiano" },
  { code: "pt", label: "Portugais", nativeLabel: "Português" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "fr";

export const LOCALE_COOKIE = "mlh_locale";

const VALID_CODES = new Set<LocaleCode>(LOCALES.map((locale) => locale.code));

export function isLocaleCode(value: string): value is LocaleCode {
  return VALID_CODES.has(value as LocaleCode);
}

export function parseLocale(value: unknown): LocaleCode | null {
  if (typeof value !== "string") return null;
  return isLocaleCode(value) ? value : null;
}

export function getLocaleLabel(
  code: LocaleCode | undefined,
  displayLocale: LocaleCode = "fr"
): string {
  const match = LOCALES.find((locale) => locale.code === code);
  if (!match) return LOCALES[0].nativeLabel;
  if (displayLocale === match.code) return match.nativeLabel;
  const labels: Record<LocaleCode, Record<LocaleCode, string>> = {
    fr: {
      fr: "Français",
      en: "Anglais",
      es: "Espagnol",
      de: "Allemand",
      it: "Italien",
      pt: "Portugais",
    },
    en: {
      fr: "French",
      en: "English",
      es: "Spanish",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
    },
    es: {
      fr: "Francés",
      en: "Inglés",
      es: "Español",
      de: "Alemán",
      it: "Italiano",
      pt: "Portugués",
    },
    de: {
      fr: "Französisch",
      en: "Englisch",
      es: "Spanisch",
      de: "Deutsch",
      it: "Italienisch",
      pt: "Portugiesisch",
    },
    it: {
      fr: "Francese",
      en: "Inglese",
      es: "Spagnolo",
      de: "Tedesco",
      it: "Italiano",
      pt: "Portoghese",
    },
    pt: {
      fr: "Francês",
      en: "Inglês",
      es: "Espanhol",
      de: "Alemão",
      it: "Italiano",
      pt: "Português",
    },
  };
  return labels[displayLocale]?.[match.code] ?? match.nativeLabel;
}
