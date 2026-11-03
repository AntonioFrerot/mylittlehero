import { AbonnementsPageContent } from "@/components/tarifs/AbonnementsPageContent";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { createTranslator } from "@/lib/i18n/translator";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator("fr");
  return buildFrenchShareMetadata({
    title: t("meta.abonnementsTitle"),
    description: t("meta.abonnementsDescription"),
    path: "/abonnements",
  });
}

export default function AbonnementsPage() {
  return (
    <>      <main>
        <AbonnementsPageContent />
      </main>
    </>
  );
}
