import Image from "next/image";
import Link from "next/link";
import { CatalogueBackgroundVideoLazy } from "@/components/CatalogueBackgroundVideoLazy";
import { MoviePosterCarousel } from "@/components/MoviePosterCarousel";
import { leoExampleFilms } from "@/lib/data";
import {
  translateExamplePosterDuration,
  translateExamplePosterTitle,
} from "@/lib/i18n/example-film-labels";
import { ExampleFilmLanguageFlag } from "@/components/films/ExampleFilmLanguageFlag";
import { getExampleFilmAudioLocale } from "@/lib/example-film-audio-locale";
import {
  filmDurationPosterBadgeClassName,
  filmNewPosterBadgeClassName,
} from "@/lib/film-meta-badges";
import { getServerTranslator } from "@/lib/i18n/server";

function PosterCard({
  title,
  src,
  durationLabel,
  href,
  posterAlt,
  audioLocale,
  audioLocaleLabel,
  isNew,
  newBadgeLabel,
}: {
  title: string;
  src: string;
  durationLabel?: string;
  href?: string;
  posterAlt: string;
  audioLocale: ReturnType<typeof getExampleFilmAudioLocale>;
  audioLocaleLabel: string;
  isNew?: boolean;
  newBadgeLabel?: string;
}) {
  const poster = (
    <div className="poster-card relative overflow-hidden rounded-2xl bg-cinema-surface shadow-poster ring-1 ring-gold/25 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-poster-hover group-hover:ring-gold/55">
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={src}
          alt={posterAlt}
          fill
          sizes="(max-width: 640px) 32vw, (max-width: 1024px) 28vw, 220px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {durationLabel && (
          <span className={filmDurationPosterBadgeClassName()}>
            {durationLabel}
          </span>
        )}
        <ExampleFilmLanguageFlag locale={audioLocale} label={audioLocaleLabel} />
        {isNew && newBadgeLabel ? (
          <span className={filmNewPosterBadgeClassName()}>{newBadgeLabel}</span>
        ) : null}
      </div>
    </div>
  );

  return (
    <article className="group relative w-[9.5rem] shrink-0 snap-center sm:w-auto sm:min-w-0 sm:shrink sm:snap-none">
      {href ? (
        <Link href={href} className="block">
          {poster}
        </Link>
      ) : (
        poster
      )}
      <h3 className="font-display mt-3 text-center text-sm font-semibold leading-snug text-cream group-hover:text-gold-light sm:mt-4 sm:text-base md:text-lg">
        {href ? (
          <Link href={href} className="hover:text-gold-light">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
    </article>
  );
}

export async function MoviePosterGrid() {
  const { locale, t } = await getServerTranslator();

  return (
    <section
      id="films-exemples"
      data-locale={locale}
      className="relative max-md:overflow-visible overflow-hidden bg-[var(--catalogue-bg)] max-md:pb-6 pb-14 pt-0 max-md:mt-0 md:-mt-[var(--catalogue-handoff-overlap)] md:overflow-visible md:bg-transparent md:py-20"
    >
      <div
        className="catalogue-handoff-bridge pointer-events-none absolute inset-x-0 top-0 z-[3] md:hidden"
        aria-hidden
      />
      <div
        className="catalogue-handoff-bridge-bottom pointer-events-none absolute inset-x-0 z-[3]"
        aria-hidden
      />
      <div
        className="catalogue-video-backdrop pointer-events-none absolute inset-x-0 z-0 max-md:overflow-visible overflow-hidden max-md:bg-transparent bg-[var(--catalogue-bg)]"
        aria-hidden
      >
        <CatalogueBackgroundVideoLazy />
        <div className="hero-overlay-tint pointer-events-none absolute inset-0 z-[1] md:hidden" aria-hidden />
        <div className="catalogue-video-overlay pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="catalogue-video-fade-top pointer-events-none absolute inset-x-0 top-0 z-[2]" aria-hidden />
        <div className="catalogue-video-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden />
      </div>

      <div className="catalogue-video-intro mx-auto max-w-2xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light/80">
          {t("home.catalogueEyebrow")}
        </p>
        <h2
          className={
            locale === "en"
              ? "catalogue-video-title catalogue-video-title--en font-display mt-3 max-md:mt-2 font-bold text-cream text-2xl md:text-3xl lg:text-4xl"
              : "catalogue-video-title font-display mt-3 text-2xl font-bold text-cream md:text-3xl lg:text-4xl"
          }
        >
          {locale === "en" ? (
            <span className="catalogue-video-title__en-line">
              {t("home.catalogueTitleBefore")}{" "}
              <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
                {t("home.catalogueTitleHighlight")}
              </span>
            </span>
          ) : (
            <>
              {t("home.catalogueTitleBefore")}{" "}
              <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
                {t("home.catalogueTitleHighlight")}
              </span>
            </>
          )}
        </h2>
        <p className="mt-3 text-sm text-cream/55 md:text-base">
          {t("home.catalogueSubtitle")}
        </p>
      </div>

      <div className="catalogue-video-content relative z-10 mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <MoviePosterCarousel itemCount={leoExampleFilms.length}>
          {leoExampleFilms.map((movie) => {
            const title = translateExamplePosterTitle(
              movie.id,
              movie.title,
              locale
            );
            const audioLocale = getExampleFilmAudioLocale(movie.seed);
            const audioLocaleLabel =
              audioLocale === "fr"
                ? t("examples.audioLocaleFr")
                : t("examples.audioLocaleEn");
            return (
              <PosterCard
                key={movie.id}
                title={title}
                src={movie.src}
                durationLabel={
                  movie.durationLabel
                    ? translateExamplePosterDuration(
                        movie.id,
                        movie.durationLabel,
                        locale
                      )
                    : undefined
                }
                href={movie.href}
                posterAlt={t("home.posterAlt", { title })}
                audioLocale={audioLocale}
                audioLocaleLabel={audioLocaleLabel}
                isNew={movie.isNew}
                newBadgeLabel={movie.isNew ? t("examples.newBadge") : undefined}
              />
            );
          })}
        </MoviePosterCarousel>

        <div className="mt-8 hidden gap-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 md:mt-14 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
          {leoExampleFilms.map((movie) => {
            const title = translateExamplePosterTitle(
              movie.id,
              movie.title,
              locale
            );
            const audioLocale = getExampleFilmAudioLocale(movie.seed);
            const audioLocaleLabel =
              audioLocale === "fr"
                ? t("examples.audioLocaleFr")
                : t("examples.audioLocaleEn");
            return (
              <PosterCard
                key={movie.id}
                title={title}
                src={movie.src}
                durationLabel={
                  movie.durationLabel
                    ? translateExamplePosterDuration(
                        movie.id,
                        movie.durationLabel,
                        locale
                      )
                    : undefined
                }
                href={movie.href}
                posterAlt={t("home.posterAlt", { title })}
                audioLocale={audioLocale}
                audioLocaleLabel={audioLocaleLabel}
                isNew={movie.isNew}
                newBadgeLabel={movie.isNew ? t("examples.newBadge") : undefined}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
