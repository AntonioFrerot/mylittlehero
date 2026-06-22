import Link from "next/link";
import { CreerSonFilmButton } from "@/components/CreerSonFilmButton";
import { getServerTranslator } from "@/lib/i18n/server";

export async function CTAFooter() {
  const { t } = await getServerTranslator();

  return (
    <footer className="relative">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/10 blur-[100px]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center sm:px-10 md:px-14 lg:px-16">
          <h2 className="font-display text-2xl font-bold leading-snug tracking-normal text-cream sm:text-3xl md:text-[2.65rem] md:leading-tight lg:text-5xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/60 md:mt-8 md:text-lg">
            {t("home.ctaText")}
          </p>
          <div className="mt-10 flex justify-center md:mt-14">
            <CreerSonFilmButton
              variant="primary"
              className="w-full max-w-sm sm:w-auto"
            />
          </div>
        </div>
      </section>

      <div className="border-t border-white/5 bg-cinema-black py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-cream/40 md:flex-row md:px-8 md:text-left lg:px-10">
          <p>
            © {new Date().getFullYear()} MyLittleHero — {t("home.footerTagline")}
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Pied de page">
            <Link href="/politique-de-confidentialite" className="hover:text-cream/70">
              {t("home.footerPrivacy")}
            </Link>
            <Link href="/cgv" className="hover:text-cream/70">
              {t("home.footerTerms")}
            </Link>
            <Link href="/cgu" className="hover:text-cream/70">
              {t("legal.documents.cgu")}
            </Link>
            <Link href="/mentions-legales" className="hover:text-cream/70">
              {t("home.footerLegal")}
            </Link>
            <Link href="/politique-cookies" className="hover:text-cream/70">
              {t("home.footerCookies")}
            </Link>
            <Link href="/contact" className="hover:text-cream/70">
              {t("nav.contact")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
