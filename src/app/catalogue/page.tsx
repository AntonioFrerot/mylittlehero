import { BrowseCatalogContent } from "@/components/browse/BrowseCatalogContent";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { createTranslator } from "@/lib/i18n/translator";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator("fr");
  return buildFrenchShareMetadata({
    title: t("meta.browseTitle"),
    description: t("meta.browseDescription"),
    path: "/catalogue",
  });
}

export default function CatalogueBrowsePage() {
  return (
    <>
      <main className="bg-cinema-black">
        <BrowseCatalogContent />
      </main>
    </>
  );
}
