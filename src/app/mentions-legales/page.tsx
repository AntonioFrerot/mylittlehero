import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { getLegalDocument } from "@/lib/legal/get-document";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const document = getLegalDocument("mentions-legales", "fr");
  return buildFrenchShareMetadata({
    title: document.title,
    description: document.description,
    path: "/mentions-legales",
  });
}

export default async function MentionsLegalesPage() {
  const { locale } = await getServerTranslator();
  const document = getLegalDocument("mentions-legales", locale);
  return <LegalDocumentPage document={document} />;
}
