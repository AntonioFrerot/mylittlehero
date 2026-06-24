import Image from "next/image";

type UserFilmHeroSpotlightProps = {
  className?: string;
  photoSrc?: string;
  photoAlt: string;
  label: string;
  intro: string;
  lead: string;
  synopsis: string;
};

export function UserFilmHeroSpotlight({
  className = "",
  photoSrc,
  photoAlt,
  label,
  intro,
  lead,
  synopsis,
}: UserFilmHeroSpotlightProps) {
  return (
    <div
      className={`rounded-xl border border-gold/25 bg-gradient-to-br from-gold/10 via-cinema-night/40 to-cinema-night/20 p-4 sm:p-5 ${className}`.trim()}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="mx-auto shrink-0 sm:mx-0">
          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-gold/45 bg-cinema-night shadow-glow-gold-subtle ring-4 ring-gold/10 sm:h-36 sm:w-36">
            {photoSrc ? (
              <Image
                src={photoSrc}
                alt={photoAlt}
                fill
                unoptimized={photoSrc.startsWith("/uploads/")}
                quality={100}
                className="object-cover object-[center_20%]"
                sizes="(max-width: 640px) 128px, 144px"
                priority
              />
            ) : (
              <span className="font-display text-3xl font-bold text-gold-light/80">
                {label.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-display mt-2.5 text-center text-base font-semibold text-gold-light sm:text-lg">
            {label}
          </p>
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <p className="text-sm font-semibold leading-snug text-cream/90 sm:text-[15px]">
            {intro}
          </p>
          <p className="text-sm leading-relaxed text-cream/70 sm:text-[15px]">
            {lead}
          </p>
          <p className="border-t border-white/10 pt-3 text-sm italic leading-relaxed text-cream/55 sm:text-[15px]">
            {synopsis}
          </p>
        </div>
      </div>
    </div>
  );
}
