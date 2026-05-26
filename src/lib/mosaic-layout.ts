import { resolvePosterAsset } from "@/lib/hero-posters";
import type { HeroPosterAsset } from "@/lib/hero-posters";

/** Toutes les affiches : ratio 2:3 — rowSpan = colSpan × 3 */
export type PosterScale = 1 | 2 | 3;

export type MosaicPlacement = {
  id: string;
  asset: HeroPosterAsset;
  colStart: number;
  colSpan: PosterScale;
  rowStart: number;
  rowSpan: number;
};

export const MOSAIC_GRID_COLS = 24;
const TARGET_ROWS = 78;

function rowSpanFor(colSpan: PosterScale) {
  return colSpan * 3;
}

function buildStructuredMosaic(): MosaicPlacement[] {
  const cols = MOSAIC_GRID_COLS;
  const rows = TARGET_ROWS;
  const occupied = Array.from({ length: rows }, () =>
    Array<boolean>(cols).fill(false),
  );

  const isFree = (
    row: number,
    col: number,
    colSpan: PosterScale,
    rowSpan: number,
  ) => {
    if (col + colSpan > cols || row + rowSpan > rows) return false;
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        if (occupied[r][c]) return false;
      }
    }
    return true;
  };

  const occupy = (
    row: number,
    col: number,
    colSpan: PosterScale,
    rowSpan: number,
  ) => {
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        occupied[r][c] = true;
      }
    }
  };

  const placements: Omit<MosaicPlacement, "asset">[] = [];

  const place = (row: number, col: number, colSpan: PosterScale) => {
    const rowSpan = rowSpanFor(colSpan);
    if (!isFree(row, col, colSpan, rowSpan)) return false;
    occupy(row, col, colSpan, rowSpan);
    placements.push({
      id: `mosaic-${placements.length}`,
      colStart: col + 1,
      colSpan,
      rowStart: row + 1,
      rowSpan,
    });
    return true;
  };

  /** Vedettes — deux grandes affiches côte à côte en haut */
  place(0, 0, 3);
  place(0, 3, 3);

  /**
   * Remplissage sans trous : balayage ligne par ligne,
   * plus grande affiche possible à chaque case libre.
   */
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (occupied[row][col]) continue;

      let placed = false;
      for (const colSpan of [3, 2, 1] as const) {
        const rowSpan = rowSpanFor(colSpan);
        if (isFree(row, col, colSpan, rowSpan)) {
          place(row, col, colSpan);
          placed = true;
          break;
        }
      }

      if (!placed) {
        throw new Error(
          `Impossible de placer une tuile en (${row}, ${col}) — vérifiez la grille.`,
        );
      }
    }
  }

  return placements.map((p, index) => ({
    ...p,
    asset: resolvePosterAsset(index),
  }));
}

export const heroMosaicPlacements = buildStructuredMosaic();
