/** Défilement fiable vers une section (ancre), même si le hash est déjà dans l’URL. */
export function scrollToSection(id: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(id);
  if (!el) return false;

  el.scrollIntoView({ behavior, block: "start" });
  const hash = `#${id}`;
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
  return true;
}

export function scrollToLocationHash(behavior: ScrollBehavior = "smooth") {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return false;
  return scrollToSection(id, behavior);
}
