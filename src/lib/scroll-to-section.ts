const PENDING_HOME_SECTION_SCROLL_KEY = "mylh:pendingHomeSectionScroll";

/** Mémorise la section cible avant navigation client vers l'accueil (hash parfois perdu). */
export function setPendingHomeSectionScroll(id: string) {
  try {
    sessionStorage.setItem(PENDING_HOME_SECTION_SCROLL_KEY, id);
  } catch {
    // sessionStorage indisponible
  }
}

export function peekPendingHomeSectionScroll(): string | null {
  try {
    return sessionStorage.getItem(PENDING_HOME_SECTION_SCROLL_KEY);
  } catch {
    return null;
  }
}

export function consumePendingHomeSectionScroll(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_HOME_SECTION_SCROLL_KEY);
    if (id) sessionStorage.removeItem(PENDING_HOME_SECTION_SCROLL_KEY);
    return id;
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

/** Défilement fiable vers une section (ancre), même si le hash est déjà dans l’URL. */
export function scrollToSection(id: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(id);
  if (!el) return false;

  el.scrollIntoView({ behavior, block: "start" });
  const hash = `#${id}`;
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
};

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
  const maxDurationMs = options?.maxDurationMs ?? 12_000;
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
    if (success) options?.onSuccess?.();
  };

  const attempt = (): boolean => {
    const scrollBehavior = attempts === 0 ? behavior : "auto";
    attempts += 1;
    if (scrollToSection(id, scrollBehavior)) {
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
