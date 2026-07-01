import { Header } from "@/components/Header";
import { TarifsPageContent } from "@/components/tarifs/TarifsPageContent";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.tarifsTitle")} — ${BRAND_NAME}`,
    description: t("meta.tarifsDescription"),
  };
}

export default function TarifsPage() {
  return (
    <>
      <Header />
      <main>
        <TarifsPageContent />
      </main>
    </>
  );
}
