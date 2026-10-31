import { resolveHomeSectionId } from "@/lib/navigation/home-sections";

const PENDING_HOME_SECTION_SCROLL_KEY = "mylh:pendingHomeSectionScroll";
export const HOME_SECTION_SCROLL_EVENT = "mylh:home-section-scroll";

export type HomeSectionScrollDetail = { id: string };

/** Mémorise la section cible avant navigation client vers l'accueil (hash parfois perdu). */
export function setPendingHomeSectionScroll(id: string) {
  try {
    sessionStorage.setItem(
      PENDING_HOME_SECTION_SCROLL_KEY,
      resolveHomeSectionId(id)
    );
  } catch {
    // sessionStorage indisponible
  }
}

export function peekPendingHomeSectionScroll(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_HOME_SECTION_SCROLL_KEY);
    return id ? resolveHomeSectionId(id) : null;
  } catch {
    return null;
  }
}

export function consumePendingHomeSectionScroll(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_HOME_SECTION_SCROLL_KEY);
    if (id) sessionStorage.removeItem(PENDING_HOME_SECTION_SCROLL_KEY);
    return id ? resolveHomeSectionId(id) : null;
  } catch {
    return null;
  }
}

export function clearPendingHomeSectionScroll() {
  try {
    sessionStorage.removeItem(PENDING_HOME_SECTION_SCROLL_KEY);
  } catch {
    // sessionStorage indisponible
  }
}

export function dispatchHomeSectionScrollRequest(id: string) {
  if (typeof window === "undefined") return;
  const resolvedId = resolveHomeSectionId(id);
  window.dispatchEvent(
    new CustomEvent<HomeSectionScrollDetail>(HOME_SECTION_SCROLL_EVENT, {
      detail: { id: resolvedId },
    })
  );
}

function resolveTargetSectionId(preferredId?: string | null): string | null {
  const fromHash = window.location.hash.replace(/^#/, "");
  const raw = preferredId || fromHash || peekPendingHomeSectionScroll();
  if (!raw) return null;
  return resolveHomeSectionId(raw);
}

/** Défilement fiable vers une section (ancre). */
export function scrollToSection(
  id: string,
  behavior: ScrollBehavior = "smooth",
  block: ScrollLogicalPosition = "center"
) {
  const resolvedId = resolveHomeSectionId(id);
  const el = document.getElementById(resolvedId);
  if (!el) return false;

  el.scrollIntoView({ behavior, block, inline: "nearest" });
  const hash = `#${resolvedId}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${hash}`
    );
  }
  return true;
}

export function scrollToLocationHash(behavior: ScrollBehavior = "smooth") {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return false;
  return scrollToSection(id, behavior);
}

type ScrollWhenReadyOptions = {
  onSuccess?: () => void;
  maxDurationMs?: number;
  block?: ScrollLogicalPosition;
  /** Re-scroll après navigation Next (scroll-to-top par défaut). */
  reassertDelaysMs?: number[];
};

const DEFAULT_REASSERT_MS = [0, 80, 200, 450, 900, 1500];

function scheduleScrollReassertions(
  id: string,
  block: ScrollLogicalPosition,
  delaysMs: number[]
) {
  for (const delay of delaysMs) {
    window.setTimeout(() => {
      scrollToSection(id, "auto", block);
    }, delay);
  }
}

/** Après fermeture du menu mobile (body en position fixed). */
export function scheduleScrollToSectionAfterUnlock(
  id: string,
  behavior: ScrollBehavior = "smooth"
): () => void {
  let innerCancel: (() => void) | undefined;
  let outerFrame = 0;
  let innerFrame = 0;

  outerFrame = requestAnimationFrame(() => {
    innerFrame = requestAnimationFrame(() => {
      innerCancel = scrollToSectionWhenReady(id, behavior);
    });
  });

  return () => {
    if (outerFrame) cancelAnimationFrame(outerFrame);
    if (innerFrame) cancelAnimationFrame(innerFrame);
    innerCancel?.();
  };
}

/** Attend que la section soit dans le DOM (navigation client, contenu RSC en streaming). */
export function scrollToSectionWhenReady(
  id: string,
  behavior: ScrollBehavior = "smooth",
  options?: ScrollWhenReadyOptions
): () => void {
  const resolvedId = resolveHomeSectionId(id);
  const maxDurationMs = options?.maxDurationMs ?? 15_000;
  const block = options?.block ?? "center";
  const reassertDelaysMs = options?.reassertDelaysMs ?? DEFAULT_REASSERT_MS;
  let finished = false;
  let raf = 0;
  let timeoutId = 0;
  let observer: MutationObserver | null = null;
  let attempts = 0;

  const finish = (success: boolean) => {
    if (finished) return;
    finished = true;
    if (raf) cancelAnimationFrame(raf);
    if (timeoutId) window.clearTimeout(timeoutId);
    observer?.disconnect();
    observer = null;
    if (success) {
      options?.onSuccess?.();
      scheduleScrollReassertions(resolvedId, block, reassertDelaysMs);
    }
  };

  const attempt = (): boolean => {
    const scrollBehavior = attempts === 0 ? behavior : "auto";
    attempts += 1;
    if (scrollToSection(resolvedId, scrollBehavior, block)) {
      finish(true);
      return true;
    }
    return false;
  };

  if (attempt()) {
    return () => finish(false);
  }

  const tick = () => {
    if (finished) return;
    if (!attempt()) {
      raf = requestAnimationFrame(tick);
    }
  };

  raf = requestAnimationFrame(tick);

  observer = new MutationObserver(() => {
    if (finished) return;
    attempt();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  timeoutId = window.setTimeout(() => finish(false), maxDurationMs);

  return () => finish(false);
}

/** Scroll vers section accueil (pending, hash ou id explicite). */
export function runPendingHomeSectionScroll(preferredId?: string | null): () => void {
  const id = resolveTargetSectionId(preferredId);
  if (!id) return () => {};

  return scrollToSectionWhenReady(id, "smooth", {
    onSuccess: () => clearPendingHomeSectionScroll(),
  });
}
