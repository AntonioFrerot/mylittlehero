import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { createTranslator } from "@/lib/i18n/translator";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator("fr");
  return buildFrenchShareMetadata({
    title: t("meta.creerTitle"),
    description: t("meta.creerDescription"),
    path: "/creer",
  });
}

export default function CreerPage() {
  return (
    <>      <main>
        <PricingPageContent />
      </main>
    </>
  );
}
