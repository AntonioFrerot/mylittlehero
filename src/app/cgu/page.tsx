import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { BRAND_NAME } from "@/lib/brand";
import { getLegalDocument } from "@/lib/legal/get-document";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerTranslator();
  const document = getLegalDocument("cgu", locale);
  return {
    title: `${document.title} — ${BRAND_NAME}`,
    description: document.description,
  };
}

export default async function CguPage() {
  const { locale } = await getServerTranslator();
  const document = getLegalDocument("cgu", locale);
  return <LegalDocumentPage document={document} />;
}
