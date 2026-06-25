"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const POLL_INTERVAL_MS = 3500;

type FilmStoryGenerationPollProps = {
  active: boolean;
};

export function FilmStoryGenerationPoll({ active }: FilmStoryGenerationPollProps) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      router.refresh();
    };

    refresh();
    const intervalId = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [active, router]);

  return null;
}
