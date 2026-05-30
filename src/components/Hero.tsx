import { CreerSonFilmButton } from "@/components/CreerSonFilmButton";
import { Button } from "@/components/ui/Button";
import { HeroPosterMosaic } from "@/components/HeroPosterMosaic";
import { getServerTranslator } from "@/lib/i18n/server";

export async function Hero() {
  const { t } = await getServerTranslator();

  return (
    <section
      id="accueil"
      className="hero-section relative flex min-h-0 flex-col justify-start overflow-hidden md:min-h-[100svh] md:justify-center"
    >
      <HeroPosterMosaic />

      <div className="hero-overlay-tint" aria-hidden />
      <div className="hero-overlay-top" aria-hidden />
      <div className="hero-overlay-bottom" aria-hidden />

      <div className="hero-content safe-top-offset">
        <p className="hero-badge">
          <span className="hero-badge-dot" aria-hidden />
          {t("home.heroBadge")}
        </p>

        <h1 className="hero-title">
          {t("home.heroTitleBefore")}{" "}
          <span className="hero-title-highlight">
            {t("home.heroTitleHighlight")}
          </span>{" "}
          {t("home.heroTitleAfter")}
        </h1>

        <div className="hero-lead">
          <p className="hero-lead-primary">{t("home.heroLead")}</p>
          <p className="hero-lead-secondary">{t("home.heroSub")}</p>
        </div>

        <div className="hero-actions">
          <CreerSonFilmButton variant="primary" className="w-full sm:w-auto" />
          <Button
            href="/#catalogue"
            variant="secondary"
            className="w-full border-white/25 bg-transparent sm:w-auto"
          >
            {t("home.heroExamples")}
          </Button>
        </div>
      </div>
    </section>
  );
}
