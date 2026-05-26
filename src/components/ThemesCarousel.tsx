"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  ThemeCard,
  themeDescKey,
  themeNameKey,
} from "@/components/ThemeCard";

export type ThemeItem = {
  id: string;
  gradient: string;
};

type ThemesCarouselProps = {
  themes: readonly ThemeItem[];
};

/** Secondes pour défiler tous les thèmes une fois (boucle = moitié du bandeau dupliqué). */
const SCROLL_DURATION_S = 78;

export function ThemesCarousel({ themes }: ThemesCarouselProps) {
  const { t } = useLocale();
  const trackRef = useRef<HTMLUListElement>(null);
  const [scrollReady, setScrollReady] = useState(false);

  const loopItems = [...themes, ...themes];

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const applyLoopMetrics = () => {
      const slides = track.querySelectorAll<HTMLElement>(".themes-portal__slide");
      const count = themes.length;
      if (slides.length < count * 2) return false;

      const styles = getComputedStyle(track);
      const gap =
        Number.parseFloat(styles.columnGap) ||
        Number.parseFloat(styles.gap) ||
        0;

      let loopPx = 0;
      for (let i = 0; i < count; i += 1) {
        const slide = slides[i];
        if (!slide) return false;
        loopPx += slide.offsetWidth;
        if (i < count - 1) loopPx += gap;
      }

      if (loopPx <= 0) return false;

      track.style.setProperty("--themes-loop-start", `-${loopPx}px`);
      track.style.setProperty(
        "--themes-scroll-duration",
        `${SCROLL_DURATION_S}s`
      );
      setScrollReady(true);
      return true;
    };

    if (applyLoopMetrics()) return;

    const observer = new ResizeObserver(() => {
      if (applyLoopMetrics()) observer.disconnect();
    });
    observer.observe(track);

    return () => observer.disconnect();
  }, [themes.length]);

  return (
    <div className="themes-portal flex justify-center">
      <div className="themes-portal__frame">
        <div className="themes-portal__stage">
          <div
            className="themes-portal__veil themes-portal__veil--left"
            aria-hidden
          />
          <div
            className="themes-portal__veil themes-portal__veil--right"
            aria-hidden
          />

          <div className="themes-portal__viewport">
            <ul
              ref={trackRef}
              className={`themes-portal__track flex w-max ${scrollReady ? "themes-portal__track--scroll" : ""}`}
            >
              {loopItems.map((theme, index) => (
                <li
                  key={`${theme.id}-${index}`}
                  className="themes-portal__slide shrink-0"
                >
                  <ThemeCard
                    id={theme.id}
                    gradient={theme.gradient}
                    title={t(themeNameKey(theme.id))}
                    description={t(themeDescKey(theme.id))}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
