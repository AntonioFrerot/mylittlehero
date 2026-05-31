import { resolvePosterAsset } from "@/lib/hero-posters";
import type { HeroPosterAsset } from "@/lib/hero-posters";

/** Grille hero — 8 affiches par rangée, alignées sans décalage. */
export const MOSAIC_GRID_COLS = 8;
export const MOSAIC_POSTER_COL_SPAN = 1;
export const MOSAIC_ROWS_DESKTOP = 4;
export const MOSAIC_ROWS_MOBILE = 9;
/** Rangée (1-based) où le fondu affiches hero est totalement opaque → transparent (mobile). */
export const MOSAIC_MOBILE_FADE_END_ROW = 7;

export type MosaicPlacement = {
  id: string;
  asset: HeroPosterAsset;
  colStart: number;
  colSpan: typeof MOSAIC_POSTER_COL_SPAN;
  rowStart: number;
};

const MOSAIC_ROWS = MOSAIC_ROWS_MOBILE;

function buildUniformMosaic(): MosaicPlacement[] {
  const placements: MosaicPlacement[] = [];
  let index = 0;

  for (let row = 0; row < MOSAIC_ROWS; row++) {
    for (let col = 0; col < MOSAIC_GRID_COLS; col++) {
      placements.push({
        id: `mosaic-${index}`,
        colStart: col + 1,
        colSpan: MOSAIC_POSTER_COL_SPAN,
        rowStart: row + 1,
        asset: resolvePosterAsset(index),
      });
      index++;
    }
  }

  return placements;
}

export const heroMosaicPlacements = buildUniformMosaic();
