import type { LocaleCode } from "./locales";
import { DEFAULT_LOCALE } from "./locales";
import { en } from "./messages/en";
import { fr } from "./messages/fr";

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringRecord<T[K]> : string;
};

export type Messages = DeepStringRecord<typeof fr>;

const catalogs: Record<LocaleCode, Messages> = {
  fr: fr as Messages,
  en: en as Messages,
  es: en as Messages,
  de: en as Messages,
  it: en as Messages,
  pt: en as Messages,
};

export function getMessages(locale: LocaleCode): Messages {
  return catalogs[locale] ?? catalogs[DEFAULT_LOCALE];
}

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<Messages>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : path;
}

export function createTranslator(locale: LocaleCode) {
  return createTranslatorFromMessages(getMessages(locale));
}

export function createTranslatorFromMessages(messages: Messages) {
  const catalog = messages as Record<string, unknown>;

  return function t(
    key: TranslationKey,
    vars?: Record<string, string | number>
  ): string {
    let text = getNestedValue(catalog, key);
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  };
}
