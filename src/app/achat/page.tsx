import { PurchasePageContent } from "@/components/pricing/PurchasePageContent";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { createTranslator } from "@/lib/i18n/translator";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator("fr");
  return buildFrenchShareMetadata({
    title: t("meta.achatTitle"),
    description: t("meta.achatDescription"),
    path: "/achat",
  });
}

export default function AchatPage() {
  return (
    <>
      <main>
        <PurchasePageContent />
      </main>
    </>
  );
}
