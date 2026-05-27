import Image from "next/image";
import Link from "next/link";
import { CatalogueBackgroundVideo } from "@/components/CatalogueBackgroundVideo";
import { MoviePosterCarousel } from "@/components/MoviePosterCarousel";
import { leoExampleFilms } from "@/lib/data";
import {
  translateExamplePosterDuration,
  translateExamplePosterTitle,
} from "@/lib/i18n/example-film-labels";
import { getServerTranslator } from "@/lib/i18n/server";

function PosterCard({
  title,
  src,
  durationLabel,
  href,
  posterAlt,
}: {
  title: string;
  src: string;
  durationLabel?: string;
  href?: string;
  posterAlt: string;
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
          <span className="absolute left-3 top-3 z-[1] rounded-md border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
            {durationLabel}
          </span>
        )}
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
      id="catalogue"
      className="relative -mt-6 overflow-hidden border-t border-white/5 py-14 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <CatalogueBackgroundVideo />
        <div className="absolute inset-0 bg-cinema-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-cinema-black/75 via-cinema-black/25 to-cinema-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/50 via-transparent to-cinema-black/50" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-48 bg-gradient-to-b from-gold/5 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light/80">
            {t("home.catalogueEyebrow")}
          </p>
          <h2 className="font-display mt-3 text-2xl font-bold text-cream md:text-3xl lg:text-4xl">
            {t("home.catalogueTitleBefore")}{" "}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              {t("home.catalogueTitleHighlight")}
            </span>
          </h2>
          <p className="mt-3 text-sm text-cream/55 md:text-base">
            {t("home.catalogueSubtitle")}
          </p>
        </div>

        <MoviePosterCarousel itemCount={leoExampleFilms.length}>
          {leoExampleFilms.map((movie) => {
            const title = translateExamplePosterTitle(
              movie.id,
              movie.title,
              locale
            );
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
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
