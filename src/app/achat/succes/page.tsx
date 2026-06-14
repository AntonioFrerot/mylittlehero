import { Header } from "@/components/Header";
import { PaymentSuccessContent } from "@/components/pricing/PaymentSuccessContent";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("checkout.successPurchaseTitle")} — ${BRAND_NAME}`,
  };
}

export default function AchatSuccesPage() {
  return (
    <>
      <Header />
      <main>
        <PaymentSuccessContent kind="purchase" />
      </main>
    </>
  );
}
