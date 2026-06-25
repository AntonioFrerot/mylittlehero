"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { FilmStoryStatusSnapshot } from "@/lib/story-generation/story-status";
import {
  storyStatusNeedsPageRefresh,
  toSnapshotMap,
} from "@/lib/story-generation/story-status";

const POLL_INTERVAL_MS = 3500;

type StoryStatusResponse = {
  films: FilmStoryStatusSnapshot[];
};

type FilmStoryGenerationPollProps = {
  filmIds: string[];
};

export function FilmStoryGenerationPoll({
  filmIds,
}: FilmStoryGenerationPollProps) {
  const router = useRouter();
  const snapshotsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (filmIds.length === 0) return;

    let cancelled = false;

    async function poll() {
      if (document.visibilityState === "hidden") return;

      try {
        const params = new URLSearchParams({
          filmIds: filmIds.join(","),
        });
        const response = await fetch(`/api/films/story-status?${params}`, {
          cache: "no-store",
        });
        if (!response.ok || cancelled) return;

        const data = (await response.json()) as StoryStatusResponse;
        const snapshots = data.films ?? [];

        if (snapshots.length === 0) return;

        if (snapshotsRef.current.size === 0) {
          snapshotsRef.current = toSnapshotMap(snapshots);
          return;
        }

        if (storyStatusNeedsPageRefresh(snapshotsRef.current, snapshots)) {
          router.refresh();
          snapshotsRef.current = toSnapshotMap(snapshots);
        }
      } catch {
        // silencieux
      }
    }

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [filmIds.join(","), router]);

  return null;
}
