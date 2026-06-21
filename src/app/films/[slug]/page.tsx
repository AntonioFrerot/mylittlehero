import { Header } from "@/components/Header";
import { ExampleFilmHeroSpotlight } from "@/components/films/ExampleFilmHeroSpotlight";
import { ExampleFilmMedia } from "@/components/films/ExampleFilmMedia";
import { HashLink } from "@/components/ui/HashLink";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/get-session";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { getExampleFilm } from "@/lib/example-films";
import { POSTER_DIMENSIONS } from "@/lib/hero-posters";
import {
  translateExampleFilmDuration,
  translateExampleFilmIntro,
  translateExampleFilmLead,
  translateExampleFilmSynopsis,
  translateExampleFilmTagline,
  translateExampleFilmTitle,
} from "@/lib/i18n/example-film-labels";
import { FilmMetaBadges } from "@/components/films/FilmMetaBadges";
import { getServerLocale, getServerTranslator } from "@/lib/i18n/server";
import { BRAND_NAME } from "@/lib/brand";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = getExampleFilm(slug);
  if (!film) return { title: `Film — ${BRAND_NAME}` };

  const locale = await getServerLocale();
  const filmTitle = translateExampleFilmTitle(slug, film.title, locale);
  const { createTranslator } = await import("@/lib/i18n/translator");

  return {
    title: `${filmTitle} — ${BRAND_NAME}`,
    description: createTranslator(locale)("examples.metaDescription"),
  };
}

export default async function ExampleFilmPage({ params }: PageProps) {
  const { slug } = await params;
  const film = getExampleFilm(slug);
  if (!film) notFound();

  const { locale, t } = await getServerTranslator();
  const session = await getSession();
  const showFreeTrialCta = session
    ? await isFreeFilmAvailableForEmail(session.email)
    : true;
  const freeTrialHref = session ? "/creer-film" : "/connexion?redirect=%2Fcreer-film";

  const filmTitle = translateExampleFilmTitle(slug, film.title, locale);
  const filmTagline = translateExampleFilmTagline(slug, film.tagline, locale);
  const primaryTheme = film.themes[0];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-16 safe-top-offset">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <HashLink
            href="/#catalogue"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("examples.backToCatalogue")}
          </HashLink>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold-light/90">
            {t("examples.eyebrow")}
          </p>
          <h1 className="font-display mt-2 text-2xl font-bold leading-tight text-cream sm:text-3xl md:text-4xl lg:text-5xl">
            {filmTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg">
            {filmTagline}
          </p>

          <FilmMetaBadges
            className="mt-4"
            themes={film.themes}
            durationLabel={translateExampleFilmDuration(
              slug,
              film.durationLabel,
              locale
            )}
            locale={locale}
          />

          <div className="mt-8 flex flex-col gap-6 sm:gap-8 lg:relative lg:gap-0">
            <ExampleFilmHeroSpotlight
              className="order-2 min-w-0 lg:order-1 lg:max-w-[calc(100%-19.5rem)] xl:max-w-[calc(100%-20.5rem)]"
              photoSrc={film.heroPhotoSrc}
              photoAlt={t("examples.leoPhotoAlt")}
              label={t("examples.leoPhotoLabel")}
              intro={translateExampleFilmIntro(slug, primaryTheme, locale)}
              lead={translateExampleFilmLead(locale)}
              synopsis={translateExampleFilmSynopsis(slug, locale)}
            />

            <aside className="order-1 mx-auto w-full max-w-[220px] shrink-0 sm:max-w-[260px] lg:absolute lg:bottom-0 lg:right-0 lg:order-2 lg:mx-0 lg:w-[280px] xl:w-[300px]">
              <div className="poster-card relative poster-aspect-box w-full overflow-hidden rounded-xl shadow-poster ring-1 ring-gold/30">
                <Image
                  src={film.posterSrc}
                  alt={t("examples.posterAlt", { title: filmTitle })}
                  width={POSTER_DIMENSIONS.width}
                  height={POSTER_DIMENSIONS.height}
                  sizes="(max-width: 1024px) 280px, 300px"
                  quality={90}
                  className="object-cover object-center"
                  priority
                />
              </div>
            </aside>
          </div>

          {showFreeTrialCta ? (
            <div className="mt-6 sm:mt-8">
              <Button
                href={freeTrialHref}
                variant="primary"
                className="w-full sm:w-auto"
              >
                {t("examples.tryFree")}
              </Button>
            </div>
          ) : null}

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-cinema-surface shadow-glow-gold-subtle">
            <ExampleFilmMedia
              film={film}
              title={filmTitle}
              posterAlt={t("examples.posterAlt", { title: filmTitle })}
              videoComingSoonLabel={
                film.videoComingSoon ? t("examples.videoComingSoon") : undefined
              }
            />
          </div>
        </div>
      </main>
    </>
  );
}
