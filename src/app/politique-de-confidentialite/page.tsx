import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { getLegalDocument } from "@/lib/legal/get-document";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const document = getLegalDocument("politique-de-confidentialite", "fr");
  return buildFrenchShareMetadata({
    title: document.title,
    description: document.description,
    path: "/politique-de-confidentialite",
  });
}

export default async function PolitiqueConfidentialitePage() {
  const { locale } = await getServerTranslator();
  const document = getLegalDocument("politique-de-confidentialite", locale);
  return <LegalDocumentPage document={document} />;
}
