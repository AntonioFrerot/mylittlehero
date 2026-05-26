"use client";

import Image from "next/image";
import Link from "next/link";
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
          { "--mosaic-cols": String(MOSAIC_GRID_COLS) } as React.CSSProperties
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
            <div
              key={tile.id}
              className="hero-mosaic-tile"
              style={{
                gridColumn: `${tile.colStart} / span ${tile.colSpan}`,
                gridRow: `${tile.rowStart} / span ${tile.rowSpan}`,
              }}
            >
              <div className="hero-mosaic-poster relative overflow-hidden rounded-md bg-cinema-surface">
                {asset.href ? (
                  <Link
                    href={asset.href}
                    className="absolute inset-0 z-[1]"
                    aria-label={`Voir l'exemple — ${title}`}
                  />
                ) : null}
                <Image
                  src={getHeroPosterSrc(asset)}
                  alt={title}
                  width={POSTER_DIMENSIONS.width}
                  height={POSTER_DIMENSIONS.height}
                  className="h-full w-full object-cover"
                  priority={asset.featured}
                />
                {asset.featured && title && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 pt-5 md:p-2 md:pt-7">
                    <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-cream/90 md:text-[11px]">
                      {title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
