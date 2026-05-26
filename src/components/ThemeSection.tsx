import { ThemesCarousel } from "@/components/ThemesCarousel";
import { themes } from "@/lib/data";
import { getServerTranslator } from "@/lib/i18n/server";

export async function ThemeSection() {
  const { t } = await getServerTranslator();

  return (
    <section id="themes" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gold/80">
            {t("home.themesEyebrow")}
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold text-cream md:text-3xl lg:text-4xl">
            {t("home.themesTitle")}
          </h2>
          <p className="mt-4 text-cream/60">{t("home.themesSubtitle")}</p>
        </div>

        <div className="relative left-1/2 mt-12 w-[100vw] max-w-[100vw] -translate-x-1/2 md:mt-16">
          <ThemesCarousel
            themes={themes.map(({ id, gradient }) => ({ id, gradient }))}
          />
        </div>
      </div>
    </section>
  );
}
