import { AbonnementsPageContent } from "@/components/tarifs/AbonnementsPageContent";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.abonnementsTitle")} — ${BRAND_NAME}`,
    description: t("meta.abonnementsDescription"),
  };
}

export default function AbonnementsPage() {
  return (
    <>      <main>
        <AbonnementsPageContent />
      </main>
    </>
  );
}
