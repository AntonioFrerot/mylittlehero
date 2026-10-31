const PENDING_HOME_SECTION_SCROLL_KEY = "mylh:pendingHomeSectionScroll";

/** Mémorise la section cible avant navigation client vers l'accueil (hash parfois perdu). */
export function setPendingHomeSectionScroll(id: string) {
  try {
    sessionStorage.setItem(PENDING_HOME_SECTION_SCROLL_KEY, id);
  } catch {
    // sessionStorage indisponible
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

/** Attend que la section soit dans le DOM (navigation client vers une autre page). */
export function scrollToSectionWhenReady(
  id: string,
  behavior: ScrollBehavior = "smooth",
  maxAttempts = 60
): () => void {
  let attempts = 0;
  let frame = 0;

  const tick = () => {
    const scrollBehavior = attempts === 0 ? behavior : "auto";
    if (scrollToSection(id, scrollBehavior)) return;

    attempts += 1;
    if (attempts < maxAttempts) {
      frame = requestAnimationFrame(tick);
    }
  };

  frame = requestAnimationFrame(tick);

  return () => {
    if (frame) cancelAnimationFrame(frame);
  };
}
