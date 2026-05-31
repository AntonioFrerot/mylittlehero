import type { TranslationKey } from "@/lib/i18n/translator";

export function themeNameKey(id: string): TranslationKey {
  return `themes.${id}` as TranslationKey;
}

export function themeDescKey(id: string): TranslationKey {
  return `themes.${id}Desc` as TranslationKey;
}
