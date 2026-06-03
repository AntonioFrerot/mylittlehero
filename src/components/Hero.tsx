import { CreerSonFilmButton } from "@/components/CreerSonFilmButton";
import { HeroMobilePosterFadeBand } from "@/components/HeroMobilePosterFadeBand";
import { Button } from "@/components/ui/Button";
import { HeroPosterMosaic } from "@/components/HeroPosterMosaic";
import { getServerTranslator } from "@/lib/i18n/server";
import { BTN_3D_HERO_BADGE } from "@/lib/ui/button-3d-classes";

export async function Hero() {
  const { t } = await getServerTranslator();

  return (
    <section
      id="accueil"
      className="hero-section relative flex min-h-0 flex-col justify-start overflow-hidden max-md:overflow-visible md:min-h-[100svh] md:justify-center"
    >
      <HeroPosterMosaic />
      <HeroMobilePosterFadeBand />

      <div className="hero-overlay-tint" aria-hidden />
      <div className="hero-overlay-top" aria-hidden />

      <div className="hero-content safe-top-offset">
        <p className={`mb-4 ${BTN_3D_HERO_BADGE}`}>
          <span
            className="h-1.5 w-1.5 rounded-full bg-gold-light"
            aria-hidden
          />
          {t("home.heroBadge")}
        </p>

        <h1 className="hero-title">
          <span className="hero-title-line">{t("home.heroTitleBefore")}</span>
          <span className="hero-title-line">
            <span className="hero-title-highlight">
              {t("home.heroTitleHighlight")}
            </span>{" "}
            {t("home.heroTitleAfter")}
          </span>
        </h1>

        <div className="hero-lead">
          <p className="hero-lead-primary">{t("home.heroLead")}</p>
          <p className="hero-lead-secondary">{t("home.heroSub")}</p>
        </div>

        <div className="hero-actions">
          <CreerSonFilmButton variant="primary" glow="full" className="w-full sm:w-auto" />
          <Button
            href="/#catalogue"
            variant="secondary"
            className="hero-examples-button w-full border-white/25 bg-transparent sm:w-auto"
          >
            {t("home.heroExamples")}
          </Button>
        </div>
      </div>

      <div className="hero-overlay-bottom" aria-hidden />
      <div className="hero-mobile-handoff-band max-md:block hidden" aria-hidden />
    </section>
  );
}
