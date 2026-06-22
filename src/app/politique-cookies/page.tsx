import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { BRAND_NAME } from "@/lib/brand";
import { getLegalDocument } from "@/lib/legal/get-document";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerTranslator();
  const document = getLegalDocument("politique-cookies", locale);
  return {
    title: `${document.title} — ${BRAND_NAME}`,
    description: document.description,
  };
}

export default async function PolitiqueCookiesPage() {
  const { locale } = await getServerTranslator();
  const document = getLegalDocument("politique-cookies", locale);
  return <LegalDocumentPage document={document} />;
}
