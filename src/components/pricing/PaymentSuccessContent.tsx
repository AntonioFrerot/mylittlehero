import Link from "next/link";
import { MON_ESPACE_DEFAULT_PATH } from "@/lib/espace/sections";
import { getServerTranslator } from "@/lib/i18n/server";
import { resolveCreerSonFilmHref } from "@/lib/navigation/creer-film.server";

type PaymentSuccessContentProps = {
  kind: "purchase" | "subscription";
};

export async function PaymentSuccessContent({ kind }: PaymentSuccessContentProps) {
  const { t } = await getServerTranslator();
  const creerHref = await resolveCreerSonFilmHref();

  const title =
    kind === "purchase" ? t("checkout.successPurchaseTitle") : t("checkout.successSubscriptionTitle");
  const message =
    kind === "purchase"
      ? t("checkout.successPurchaseMessage")
      : t("checkout.successSubscriptionMessage");

  return (
    <div className="relative min-h-screen bg-cinema-black pb-20 safe-top-offset md:pb-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cinema-night to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-lg px-4 py-24 text-center md:px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-gold/80">
          {t("checkout.successBadge")}
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold text-cream md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base text-cream/65 md:text-lg">{message}</p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href={creerHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-semibold text-cinema-black transition hover:bg-gold-light"
          >
            {t("checkout.successCta")}
          </Link>
          <Link
            href={MON_ESPACE_DEFAULT_PATH}
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("checkout.successAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
