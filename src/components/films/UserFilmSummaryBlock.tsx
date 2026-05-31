type UserFilmSummaryBlockProps = {
  className?: string;
  synopsisHeading: string;
  synopsis: string;
};

export function UserFilmSummaryBlock({
  className = "",
  synopsisHeading,
  synopsis,
}: UserFilmSummaryBlockProps) {
  return (
    <div
      className={`rounded-xl border border-gold/25 bg-gradient-to-br from-gold/10 via-cinema-night/40 to-cinema-night/20 p-4 sm:p-5 ${className}`.trim()}
    >
      <div className="min-w-0 text-center sm:text-left">
        <p className="text-sm font-semibold leading-snug text-cream sm:text-[15px]">
          {synopsisHeading}
        </p>
        <p className="mt-2 text-sm italic leading-relaxed text-cream/55 sm:text-[15px]">
          {synopsis}
        </p>
      </div>
    </div>
  );
}
