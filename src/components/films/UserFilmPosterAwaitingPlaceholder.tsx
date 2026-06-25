import Image from "next/image";

const POSTER_PLACEHOLDER_SRC = "/posters/film-poster-awaiting-preview.png?v=3";

type UserFilmPosterAwaitingPlaceholderProps = {
  ariaLabel: string;
};

export function UserFilmPosterAwaitingPlaceholder({
  ariaLabel,
}: UserFilmPosterAwaitingPlaceholderProps) {
  return (
    <div
      className="poster-card relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-poster ring-1 ring-gold/30"
      role="img"
      aria-label={ariaLabel}
    >
      <Image
        src={POSTER_PLACEHOLDER_SRC}
        alt=""
        fill
        className="object-cover object-center scale-105 blur-[3px]"
        sizes="(max-width: 1024px) 280px, 300px"
        quality={90}
        priority
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-cinema-black/75 via-cinema-black/35 to-cinema-black/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        aria-hidden
      >
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/45 bg-cinema-black/60 font-display text-4xl font-bold leading-none text-gold-light shadow-glow-gold-subtle backdrop-blur-md sm:h-[4.5rem] sm:w-[4.5rem] sm:text-5xl">
          ?
        </span>
      </div>
    </div>
  );
}
