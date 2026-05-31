import Link from "next/link";

const createFilmButtonClassName =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.98] bg-gradient-to-r from-gold-dark via-gold to-gold-light text-cinema-black shadow-glow-gold hover:brightness-110 hover:scale-[1.02] !text-sm";

type BrowseThemeCreatePanelProps = {
  gradient: string;
  themeLabel: string;
  emptyTitle: string;
  emptyHint: string;
  createHref: string;
  createLabel: string;
};

export function BrowseThemeCreatePanel({
  gradient,
  themeLabel,
  emptyTitle,
  emptyHint,
  createHref,
  createLabel,
}: BrowseThemeCreatePanelProps) {
  return (
    <div className={`browse-theme-cta ${gradient}`}>
      <div className="browse-theme-cta__inner">
        <p className="browse-theme-cta__title">{emptyTitle}</p>
        <p className="browse-theme-cta__hint">{emptyHint}</p>
        <div className="browse-theme-cta__action">
          <Link href={createHref} className={createFilmButtonClassName}>
            {createLabel}
          </Link>
        </div>
        <p className="sr-only">{themeLabel}</p>
      </div>
    </div>
  );
}
