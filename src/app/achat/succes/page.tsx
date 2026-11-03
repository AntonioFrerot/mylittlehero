import { PaymentSuccessContent } from "@/components/pricing/PaymentSuccessContent";
import { buildFrenchShareMetadata } from "@/lib/i18n/metadata";
import { createTranslator } from "@/lib/i18n/translator";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator("fr");
  return buildFrenchShareMetadata({
    title: t("checkout.successPurchaseTitle"),
    path: "/achat/succes",
    robots: { index: false, follow: false },
  });
}

export default function AchatSuccesPage() {
  return (
    <>
      <main>
        <PaymentSuccessContent kind="purchase" />
      </main>
    </>
  );
}
