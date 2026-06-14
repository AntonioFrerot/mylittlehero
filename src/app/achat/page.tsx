import { Header } from "@/components/Header";
import { PurchasePageContent } from "@/components/pricing/PurchasePageContent";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.achatTitle")} — ${BRAND_NAME}`,
    description: t("meta.achatDescription"),
  };
}

export default function AchatPage() {
  return (
    <>
      <Header />
      <main>
        <PurchasePageContent />
      </main>
    </>
  );
}
