export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/")[2];
        return id || null;
      }
      const v = parsed.searchParams.get("v");
      return v || null;
    }
  } catch {
    return null;
  }

  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeVideoId(url) !== null;
}

export type YouTubeEmbedOptions = {
  autoplay?: boolean;
  origin?: string;
};

export function getYouTubeEmbedUrl(
  videoId: string,
  options: YouTubeEmbedOptions = {}
): string {
  const params = new URLSearchParams({
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    playsinline: "1",
    controls: "1",
    fs: "1",
  });

  if (options.autoplay) {
    params.set("autoplay", "1");
  }
  if (options.origin) {
    params.set("origin", options.origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
