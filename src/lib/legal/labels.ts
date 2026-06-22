import type { TranslationKey } from "@/lib/i18n/translator";
import type { LegalDocumentSlug } from "./types";

export const LEGAL_DOCUMENT_LABEL_KEYS: Record<
  LegalDocumentSlug,
  TranslationKey
> = {
  "mentions-legales": "legal.documents.mentionsLegales",
  "politique-de-confidentialite": "legal.documents.politiqueConfidentialite",
  cgv: "legal.documents.cgv",
  cgu: "legal.documents.cgu",
  "politique-cookies": "legal.documents.politiqueCookies",
};
