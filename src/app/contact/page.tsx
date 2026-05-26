import { Header } from "@/components/Header";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT_EMAIL } from "@/lib/contact/constants";
import { getSession } from "@/lib/auth/get-session";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.contactTitle")} — ${BRAND_NAME}`,
    description: t("meta.contactDescription"),
  };
}

export default async function ContactPage() {
  const session = await getSession();
  const { t } = await getServerTranslator();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20 safe-top-offset">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <Link
            href="/"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("contact.backHome")}
          </Link>

          <h1 className="font-display mt-8 text-center text-3xl font-bold text-cream md:text-4xl">
            {t("contact.title")}
          </h1>
          <p className="mt-3 text-center text-cream/65">{t("contact.lead")}</p>

          <p className="mt-6 text-center text-sm text-cream/50">
            {t("contact.emailHint")}{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-gold-light hover:text-gold"
            >
              {CONTACT_EMAIL}
            </a>
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-cinema-surface/80 p-6 md:p-8">
            <ContactForm defaultEmail={session?.email} />
          </div>
        </div>
      </main>
    </>
  );
}
