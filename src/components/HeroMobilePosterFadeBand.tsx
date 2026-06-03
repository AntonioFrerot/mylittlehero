"use client";

import { useEffect } from "react";

const MOBILE_MQ = "(max-width: 767px)";

function measureLength(element: HTMLElement, value: string) {
  const probe = document.createElement("div");
  probe.style.height = value;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  element.appendChild(probe);
  const height = probe.offsetHeight;
  probe.remove();
  return height;
}

function clearMobileHeroVars(hero: HTMLElement, root: HTMLElement) {
  hero.style.removeProperty("--hero-catalogue-handoff-band-top");
  root.style.removeProperty("--catalogue-video-offset-top");
}

export function HeroMobilePosterFadeBand() {
  useEffect(() => {
    const hero = document.getElementById("accueil");
    if (!hero) return;

    const media = window.matchMedia(MOBILE_MQ);
    const root = document.documentElement;

    const sync = () => {
      if (!media.matches) {
        clearMobileHeroVars(hero, root);
        return;
      }

      const catalogue = document.getElementById("catalogue");
      if (!catalogue) return;

      const heroTop = hero.getBoundingClientRect().top;
      const overlapValue =
        getComputedStyle(root)
          .getPropertyValue("--hero-catalogue-handoff-overlap")
          .trim() || "2rem";
      const overlapPx = measureLength(hero, overlapValue);
      const heroBottom = hero.getBoundingClientRect().bottom;
      const catalogueTop = catalogue.getBoundingClientRect().top;
      const offset = Math.max(0, Math.ceil(heroBottom - catalogueTop - overlapPx));

      root.style.setProperty("--catalogue-video-offset-top", `${offset}px`);

      const videoBackdrop = catalogue.querySelector<HTMLElement>(
        ".catalogue-video-backdrop",
      );
      if (videoBackdrop) {
        const handoffBandHeightPx = measureLength(
          hero,
          getComputedStyle(root)
            .getPropertyValue("--hero-catalogue-handoff-band-height")
            .trim() || "1.68rem",
        );
        const heroShareRaw = Number.parseFloat(
          getComputedStyle(root)
            .getPropertyValue("--hero-catalogue-handoff-band-hero-share")
            .trim(),
        );
        const heroShare =
          Number.isFinite(heroShareRaw) && heroShareRaw > 0 && heroShareRaw < 1
            ? heroShareRaw
            : 0.8;
        const videoTop = videoBackdrop.getBoundingClientRect().top;
        const bandTop = videoTop - heroTop - handoffBandHeightPx * heroShare;

        hero.style.setProperty(
          "--hero-catalogue-handoff-band-top",
          `${bandTop}px`,
        );
      }
    };

    sync();

    const catalogue = document.getElementById("catalogue");
    const videoBackdrop = catalogue?.querySelector(".catalogue-video-backdrop");
    const observer = new ResizeObserver(sync);
    observer.observe(hero);
    if (catalogue) observer.observe(catalogue);
    if (videoBackdrop) observer.observe(videoBackdrop);

    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      clearMobileHeroVars(hero, root);
    };
  }, []);

  return null;
}
