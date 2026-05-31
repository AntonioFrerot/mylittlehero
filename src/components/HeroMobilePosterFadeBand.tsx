"use client";

import { useEffect } from "react";
import {
  MOSAIC_GRID_COLS,
  MOSAIC_MOBILE_FADE_END_ROW,
} from "@/lib/mosaic-layout";

const MOBILE_MQ = "(max-width: 767px)";
const FADE_FRACTIONS = [0, 0.14, 0.3, 0.48, 0.66, 0.82, 0.94, 1];

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

function measureCm(element: HTMLElement, value = "0.5cm") {
  return measureLength(element, value);
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function buildHeroHandoffMask(fadeStart: number, fadeHeightPx: number, fadeEnd: number) {
  const stops = FADE_FRACTIONS.map((fraction) => {
    const opacity = 1 - easeOutCubic(fraction);
    const position = fadeStart + fadeHeightPx * fraction;
    return `rgba(0, 0, 0, ${opacity.toFixed(3)}) ${position}px`;
  });

  return `linear-gradient(to bottom, #000 0, #000 ${fadeStart}px, ${stops.join(", ")}, transparent ${fadeEnd}px, transparent 100%)`;
}

function measureMosaicRowTopRel(
  mosaicGrid: Element,
  heroTop: number,
  row: number,
  cols = MOSAIC_GRID_COLS,
) {
  const tiles = mosaicGrid.querySelectorAll(".hero-mosaic-tile");
  const tile = tiles[(row - 1) * cols] as HTMLElement | undefined;
  if (!tile) return null;
  return tile.getBoundingClientRect().top - heroTop;
}

function readFadeEndRow(root: HTMLElement) {
  const raw = getComputedStyle(root).getPropertyValue("--hero-poster-fade-end-row").trim();
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : MOSAIC_MOBILE_FADE_END_ROW;
}

function clearMobileHeroVars(hero: HTMLElement, root: HTMLElement) {
  hero.style.removeProperty("--hero-poster-fade-top");
  root.style.removeProperty("--hero-mobile-handoff-fade");
  root.style.removeProperty("--hero-handoff-fade-start");
  root.style.removeProperty("--hero-handoff-fade-end");
  root.style.removeProperty("--hero-handoff-mask-image");
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

      const mosaicWrap = hero.querySelector(".hero-mosaic-wrap");
      const mosaicGrid = hero.querySelector(".hero-mosaic-grid");
      const examplesButton = hero.querySelector<HTMLElement>(".hero-examples-button");
      if (!mosaicWrap) return;

      const heroTop = hero.getBoundingClientRect().top;
      const wrapBottom = mosaicWrap.getBoundingClientRect().bottom;
      const edgeFadeBottom =
        getComputedStyle(root).getPropertyValue("--catalogue-edge-fade-bottom").trim() ||
        "2.24rem";
      const bandHeightPx = measureLength(
        hero,
        getComputedStyle(root).getPropertyValue("--hero-poster-fade-band").trim() ||
          `calc(${edgeFadeBottom} + 0.6cm + 0.5cm)`,
      );
      const shiftDownPx = measureLength(
        hero,
        getComputedStyle(root).getPropertyValue("--catalogue-mobile-shift-down").trim() ||
          "0cm",
      );
      const bandRisePx = measureLength(
        hero,
        getComputedStyle(root).getPropertyValue("--hero-poster-band-rise").trim() || "1cm",
      );
      const bandTopRel = wrapBottom - heroTop + shiftDownPx;
      hero.style.setProperty(
        "--hero-poster-fade-top",
        `${Math.max(0, bandTopRel)}px`,
      );

      const catalogue = document.getElementById("catalogue");
      if (catalogue) {
        const bandOverlapPx = measureLength(hero, "0.5cm");
        const bandBottom = wrapBottom + shiftDownPx + bandHeightPx - bandRisePx;
        const catalogueTop = catalogue.getBoundingClientRect().top;
        const catalogueOffset = Math.max(
          0,
          Math.ceil(bandBottom - catalogueTop - bandOverlapPx),
        );
        root.style.setProperty("--catalogue-video-offset-top", `${catalogueOffset}px`);
      }

      if (mosaicGrid) {
        const minFadePx = measureCm(hero);
        const fadeEndRow = readFadeEndRow(root);
        let fadeEndRel = wrapBottom - heroTop;
        const rowTopRel = measureMosaicRowTopRel(mosaicGrid, heroTop, fadeEndRow);
        if (rowTopRel !== null) {
          fadeEndRel = rowTopRel;
        }

        const fadeEnd = Math.max(0, fadeEndRel);
        const fadeStart = Math.max(0, fadeEnd - minFadePx);
        const fadeHeightPx = fadeEnd - fadeStart;

        root.style.setProperty("--hero-mobile-handoff-fade", `${fadeHeightPx}px`);
        root.style.setProperty("--hero-handoff-fade-start", `${fadeStart}px`);
        root.style.setProperty("--hero-handoff-fade-end", `${fadeEnd}px`);
        root.style.setProperty(
          "--hero-handoff-mask-image",
          buildHeroHandoffMask(fadeStart, fadeHeightPx, fadeEnd),
        );
      }
    };

    sync();

    const mosaicWrap = hero.querySelector(".hero-mosaic-wrap");
    const mosaicGrid = hero.querySelector(".hero-mosaic-grid");
    const examplesButton = hero.querySelector(".hero-examples-button");
    const catalogue = document.getElementById("catalogue");
    const observer = new ResizeObserver(sync);
    observer.observe(hero);
    if (mosaicWrap) observer.observe(mosaicWrap);
    if (mosaicGrid) observer.observe(mosaicGrid);
    if (examplesButton) observer.observe(examplesButton);
    if (catalogue) observer.observe(catalogue);

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
