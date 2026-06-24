export const FREE_TRIAL_INTENT_STORAGE_KEY = "mylittlehero-free-trial-intent";
export const FREE_TRIAL_INTENT_QUERY_PARAM = "essai";
export const CREER_FILM_WITH_FREE_TRIAL_INTENT = `/creer-film?${FREE_TRIAL_INTENT_QUERY_PARAM}=1`;

export function readFreeTrialIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FREE_TRIAL_INTENT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markFreeTrialIntent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FREE_TRIAL_INTENT_STORAGE_KEY, "1");
  } catch {
    // silencieux
  }
}

export function buildCreerFilmFreeTrialHref(isLoggedIn: boolean): string {
  return isLoggedIn
    ? CREER_FILM_WITH_FREE_TRIAL_INTENT
    : `/connexion?redirect=${encodeURIComponent(CREER_FILM_WITH_FREE_TRIAL_INTENT)}`;
}

export function hasFreeTrialIntentFromSearchParam(
  searchParams: Pick<URLSearchParams, "get">
): boolean {
  return searchParams.get(FREE_TRIAL_INTENT_QUERY_PARAM) === "1";
}
