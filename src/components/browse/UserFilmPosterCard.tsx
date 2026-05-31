import Image from "next/image";
import Link from "next/link";
import {
  formatFilmDurationSeconds,
  getFilmDurationSeconds,
} from "@/lib/film-creation/duration";
import { getFilmDisplayPosterSrc } from "@/lib/browse-catalog";
import type { UserFilm } from "@/lib/film-creation/types";

type UserFilmPosterCardProps = {
  film: UserFilm;
  href: string;
  posterAlt: string;
  durationLocale: "fr" | "en";
  showTitle?: boolean;
};

export function UserFilmPosterCard({
  film,
  href,
  posterAlt,
  durationLocale,
  showTitle = true,
}: UserFilmPosterCardProps) {
  const posterSrc = getFilmDisplayPosterSrc(film);
  if (!posterSrc) return null;

  const durationSec = getFilmDurationSeconds(film);
  const durationLabel =
    durationSec != null
      ? formatFilmDurationSeconds(durationSec, durationLocale).toUpperCase()
      : undefined;

  return (
    <article className="group relative w-[9.5rem] shrink-0 snap-center sm:w-[11rem] md:w-[12.5rem]">
      <Link href={href} className="block">
        <div className="poster-card relative overflow-hidden rounded-2xl bg-cinema-surface shadow-poster ring-1 ring-gold/25 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-poster-hover group-hover:ring-gold/55">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={posterSrc}
              alt={posterAlt}
              fill
              sizes="(max-width: 640px) 32vw, 200px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            {durationLabel && (
              <span className="absolute left-3 top-3 z-[1] rounded-md border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
                {durationLabel}
              </span>
            )}
          </div>
        </div>
      </Link>
      {showTitle && (
        <h3 className="font-display mt-3 text-center text-sm font-semibold leading-snug text-cream group-hover:text-gold-light">
          <Link href={href} className="hover:text-gold-light">
            {film.title}
          </Link>
        </h3>
      )}
    </article>
  );
}
