import type { LocaleCode } from "@/lib/i18n/locales";
import { getEnglishLegalDocument } from "./content/en";
import { getFrenchLegalDocument } from "./content/fr";
import { getLegalPublisher } from "./publisher";
import type { LegalDocument, LegalDocumentSlug } from "./types";

export function getLegalDocument(
  slug: LegalDocumentSlug,
  locale: LocaleCode
): LegalDocument {
  const publisher = getLegalPublisher();
  if (locale === "fr") {
    return getFrenchLegalDocument(slug, publisher);
  }
  return getEnglishLegalDocument(slug, publisher);
}

export function getLegalDocumentTitle(
  slug: LegalDocumentSlug,
  locale: LocaleCode
): string {
  return getLegalDocument(slug, locale).title;
}
