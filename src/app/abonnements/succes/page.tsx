import { PaymentSuccessContent } from "@/components/pricing/PaymentSuccessContent";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { createTranslator } from "@/lib/i18n/translator";
import type { Metadata } from "next";

type PageProps = {
  searchParams: Promise<{ kind?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator("fr");
  return buildFrenchShareMetadata({
    title: t("checkout.successSubscriptionTitle"),
    path: "/abonnements/succes",
    robots: { index: false, follow: false },
  });
}

export default async function AbonnementsSuccesPage({ searchParams }: PageProps) {
  const { kind } = await searchParams;

  return (
    <>      <main>
        <PaymentSuccessContent kind={kind === "purchase" ? "purchase" : "subscription"} />
      </main>
    </>
  );
}
