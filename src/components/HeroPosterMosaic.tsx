"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  getHeroPosterSrc,
  POSTER_DIMENSIONS,
} from "@/lib/hero-posters";
import { translateExamplePosterTitle } from "@/lib/i18n/example-film-labels";
import {
  heroMosaicPlacementsDesktop,
  heroMosaicPlacementsMobile,
  MOSAIC_GRID_COLS,
} from "@/lib/mosaic-layout";

const MOBILE_MOSAIC_MQ = "(max-width: 767px)";

function subscribeMobileMosaic(onChange: () => void) {
  const media = window.matchMedia(MOBILE_MOSAIC_MQ);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMobileMosaicSnapshot() {
  return window.matchMedia(MOBILE_MOSAIC_MQ).matches;
}

function getMobileMosaicServerSnapshot() {
  return true;
}

export function HeroPosterMosaic() {
  const { locale } = useLocale();
  const isMobile = useSyncExternalStore(
    subscribeMobileMosaic,
    getMobileMosaicSnapshot,
    getMobileMosaicServerSnapshot
  );
  const placements = isMobile
    ? heroMosaicPlacementsMobile
    : heroMosaicPlacementsDesktop;

  return (
    <div className="hero-mosaic-wrap" aria-hidden>
      <div
        className="hero-mosaic-grid"
        style={
          {
            "--mosaic-cols": String(MOSAIC_GRID_COLS),
            "--poster-width": String(POSTER_DIMENSIONS.width),
            "--poster-height": String(POSTER_DIMENSIONS.height),
          } as React.CSSProperties
        }
      >
        {placements.map((tile) => {
          const { asset } = tile;
          const title = translateExamplePosterTitle(
            asset.id,
            asset.title,
            locale
          );
          const isLcpCandidate =
            tile.rowStart === 1 && tile.colStart >= 3 && tile.colStart <= 6;

          return (
            <div key={tile.id} className="hero-mosaic-tile">
              <div className="hero-mosaic-poster relative overflow-hidden rounded-md bg-cinema-surface">
                <Image
                  src={getHeroPosterSrc(asset)}
                  alt={title}
                  fill
                  quality={70}
                  sizes="(max-width: 767px) 17vw, 12vw"
                  className="object-cover object-center"
                  priority={isLcpCandidate}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
