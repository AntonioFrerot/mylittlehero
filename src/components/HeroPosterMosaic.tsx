"use client";

import Image from "next/image";
import { useLocale } from "@/components/LocaleProvider";
import {
  getHeroPosterSrc,
  POSTER_DIMENSIONS,
} from "@/lib/hero-posters";
import { translateExamplePosterTitle } from "@/lib/i18n/example-film-labels";
import {
  heroMosaicPlacements,
  MOSAIC_GRID_COLS,
} from "@/lib/mosaic-layout";

export function HeroPosterMosaic() {
  const { locale } = useLocale();

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
        {heroMosaicPlacements.map((tile) => {
          const { asset } = tile;
          const title = translateExamplePosterTitle(
            asset.id,
            asset.title,
            locale
          );

          return (
            <div key={tile.id} className="hero-mosaic-tile">
              <div className="hero-mosaic-poster relative overflow-hidden rounded-md bg-cinema-surface">
                <Image
                  src={getHeroPosterSrc(asset)}
                  alt={title}
                  fill
                  quality={90}
                  sizes="(max-width: 767px) 17vw, 490px"
                  className="object-cover object-center"
                  priority={tile.rowStart <= 2}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
