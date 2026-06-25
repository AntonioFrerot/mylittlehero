import type { StoryGenerationStatus } from "@/lib/story-generation/types";

export type FilmStoryStatusSnapshot = {
  filmId: string;
  status: StoryGenerationStatus | null;
  hasResume: boolean;
};

export function snapshotKey(snapshot: FilmStoryStatusSnapshot): string {
  return `${snapshot.status ?? "none"}:${snapshot.hasResume ? "1" : "0"}`;
}

/** Rafraîchir la page seulement quand le résumé est prêt ou en échec. */
export function storyStatusNeedsPageRefresh(
  previous: Map<string, string>,
  snapshots: FilmStoryStatusSnapshot[]
): boolean {
  for (const snapshot of snapshots) {
    const prevKey = previous.get(snapshot.filmId);
    if (prevKey == null) continue;

    const nextKey = snapshotKey(snapshot);
    if (prevKey === nextKey) continue;

    if (snapshot.status === "failed") return true;
    if (snapshot.status === "completed" && snapshot.hasResume) return true;
  }

  return false;
}

export function toSnapshotMap(
  snapshots: FilmStoryStatusSnapshot[]
): Map<string, string> {
  return new Map(snapshots.map((s) => [s.filmId, snapshotKey(s)]));
}
