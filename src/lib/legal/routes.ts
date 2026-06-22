import type { LegalDocumentSlug } from "./types";

export const LEGAL_ROUTES: Record<LegalDocumentSlug, string> = {
  "mentions-legales": "/mentions-legales",
  "politique-de-confidentialite": "/politique-de-confidentialite",
  cgv: "/cgv",
  cgu: "/cgu",
  "politique-cookies": "/politique-cookies",
};

export const LEGAL_DOCUMENT_SLUGS = Object.keys(
  LEGAL_ROUTES
) as LegalDocumentSlug[];
