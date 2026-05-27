import { CreerSonFilmButton } from "@/components/CreerSonFilmButton";
import { Button } from "@/components/ui/Button";
import { HeroPosterMosaic } from "@/components/HeroPosterMosaic";
import { getServerTranslator } from "@/lib/i18n/server";

export async function Hero() {
  const { t } = await getServerTranslator();

  return (
    <section
      id="accueil"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden"
    >
      <HeroPosterMosaic />

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,15,0.15)_0%,rgba(5,7,15,0.72)_58%,rgba(5,7,15,0.95)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cinema-night/20 to-cinema-black"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cinema-night/90 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cinema-black via-cinema-black/80 to-transparent"
        aria-hidden
      />

      <div
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-14 text-center safe-top-offset md:px-8 md:pb-24"
        style={{ paddingTop: "max(6rem, calc(5rem + env(safe-area-inset-top, 0px)))" }}
      >
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-black/40 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gold-light backdrop-blur-md md:text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-light shadow-glow-gold" />
          {t("home.heroBadge")}
        </p>

        <h1 className="font-display text-[1.65rem] font-bold leading-[1.15] tracking-tight text-cream drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)] min-[380px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
          {t("home.heroTitleBefore")}{" "}
          <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
            {t("home.heroTitleHighlight")}
          </span>{" "}
          {t("home.heroTitleAfter")}
        </h1>

        <div className="mt-5 max-w-2xl space-y-3 text-base leading-relaxed text-cream/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)] md:mt-6 md:text-lg lg:text-xl">
          <p>{t("home.heroLead")}</p>
          <p className="hidden text-cream/75 md:block md:text-base lg:text-lg">
            {t("home.heroSub")}
          </p>
        </div>

        <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <CreerSonFilmButton variant="primary" className="w-full sm:w-auto" />
          <Button
            href="/#catalogue"
            variant="secondary"
            className="w-full border-white/20 bg-black/40 sm:w-auto"
          >
            {t("home.heroExamples")}
          </Button>
        </div>
      </div>
    </section>
  );
}
