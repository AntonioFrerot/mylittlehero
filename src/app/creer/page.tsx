import { Header } from "@/components/Header";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.creerTitle")} — ${BRAND_NAME}`,
    description: t("meta.creerDescription"),
  };
}

export default function CreerPage() {
  return (
    <>
      <Header />
      <main>
        <PricingPageContent />
      </main>
    </>
  );
}
