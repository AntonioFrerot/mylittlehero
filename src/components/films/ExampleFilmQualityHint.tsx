"use client";

import { useLocale } from "@/components/LocaleProvider";

type ExampleFilmQualityHintProps = {
  onDismiss: () => void;
};

export function ExampleFilmQualityHint({ onDismiss }: ExampleFilmQualityHintProps) {
  const { t } = useLocale();

  return (
    <div className="absolute inset-0 z-10" role="presentation">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onDismiss}
        aria-label={t("examples.qualityHint.dismiss")}
      />
      <div
        role="dialog"
        aria-labelledby="quality-hint-title quality-hint-desc"
        className="pointer-events-none absolute right-2 top-[22%] z-10 w-[min(7.75rem,68vw)] -translate-x-0.5 sm:right-6 sm:top-[9%] sm:w-48 sm:-translate-x-px"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-auto relative rounded-lg border border-gold/45 bg-cinema-night/95 px-2.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md sm:rounded-xl sm:px-3.5 sm:py-2.5">
          <span
            className="absolute right-2 top-1.5 text-gold-light sm:right-3 sm:top-2"
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 sm:h-5 sm:w-5"
              fill="currentColor"
            >
              <path d="M12 4l8 8H4l8-8z" />
            </svg>
          </span>

          <p
            id="quality-hint-title"
            className="pr-6 text-[0.58rem] font-semibold uppercase tracking-widest text-gold-light sm:pr-7 sm:text-xs"
          >
            {t("examples.qualityHint.title")}
          </p>
          <p
            id="quality-hint-desc"
            className="mt-1 pr-6 text-[0.65rem] font-medium leading-snug text-cream/90 sm:mt-1.5 sm:pr-7 sm:text-sm"
          >
            {t("examples.qualityHint.message")}
          </p>
        </div>
      </div>
    </div>
  );
}
