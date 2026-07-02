import { BrowseCatalogContent } from "@/components/browse/BrowseCatalogContent";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.browseTitle")} — ${BRAND_NAME}`,
    description: t("meta.browseDescription"),
  };
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
