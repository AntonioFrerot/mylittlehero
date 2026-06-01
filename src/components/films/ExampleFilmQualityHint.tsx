"use client";

import { useLocale } from "@/components/LocaleProvider";
import { SURFACE_3D_CALLOUT } from "@/lib/ui/button-3d-classes";

export function ExampleFilmQualityHint() {
  const { t } = useLocale();

  return (
    <div
      role="note"
      aria-labelledby="quality-hint-title quality-hint-desc"
      className="quality-hint pointer-events-none absolute right-[calc(0.5rem+3px)] top-[22%] z-10 w-[min(9.25rem,84vw)] -translate-x-0.5 sm:right-[calc(1.5rem+3px)] sm:top-[9%] sm:w-48 sm:-translate-x-px"
    >
      <div className="quality-hint__anim pointer-events-none">
        <div className={`${SURFACE_3D_CALLOUT} quality-hint__card backdrop-blur-md`}>
          <span
            className="quality-hint__arrow absolute right-2 top-1.5 text-gold-light sm:right-3 sm:top-2"
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
            className="pr-4 text-[0.58rem] font-semibold uppercase leading-tight tracking-wide text-gold-light sm:pr-7 sm:text-xs sm:tracking-widest"
          >
            <span className="block sm:inline">{t("examples.qualityHint.titleLine1")}</span>
            <span className="block sm:inline">
              <span className="hidden sm:inline"> </span>
              {t("examples.qualityHint.titleLine2")}
            </span>
          </p>
          <p
            id="quality-hint-desc"
            className="mt-1 max-w-[18.5ch] pr-4 text-[0.65rem] font-medium leading-[1.35] text-pretty text-cream/90 sm:mt-1.5 sm:max-w-none sm:pr-7 sm:text-sm sm:leading-snug"
          >
            {t("examples.qualityHint.message")}
          </p>
        </div>
      </div>
    </div>
  );
}
