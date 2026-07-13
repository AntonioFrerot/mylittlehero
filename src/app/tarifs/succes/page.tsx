import { PaymentSuccessContent } from "@/components/pricing/PaymentSuccessContent";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

type PageProps = {
  searchParams: Promise<{ kind?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("checkout.successSubscriptionTitle")} — ${BRAND_NAME}`,
  };
}

export default async function TarifsSuccesPage({ searchParams }: PageProps) {
  const { kind } = await searchParams;

  return (
    <>
      <main>
        <PaymentSuccessContent kind={kind === "purchase" ? "purchase" : "subscription"} />
      </main>
    </>
  );
}
