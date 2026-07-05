export const WELCOME_SAMPLE_OFFER_QUERY_PARAM = "bienvenue";

export const AUTH_REDIRECT_SIGNUP_DEFAULT = `/mon-espace?section=films&${WELCOME_SAMPLE_OFFER_QUERY_PARAM}=1`;

export const WELCOME_SAMPLE_OFFER_STORAGE_PREFIX =
  "mylittlehero-welcome-sample-offer";

export type WelcomeSampleOfferStorageState = "dismissed" | "purchased";

function storageKey(email: string, suffix: WelcomeSampleOfferStorageState) {
  return `${WELCOME_SAMPLE_OFFER_STORAGE_PREFIX}:${suffix}:${email}`;
}

export function readWelcomeSampleOfferState(
  email: string
): WelcomeSampleOfferStorageState | null {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem(storageKey(email, "purchased")) === "1") {
      return "purchased";
    }
    if (localStorage.getItem(storageKey(email, "dismissed")) === "1") {
      return "dismissed";
    }
    return null;
  } catch {
    return null;
  }
}

export function markWelcomeSampleOfferDismissed(email: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(email, "dismissed"), "1");
  } catch {
    // silencieux
  }
}

export function markWelcomeSampleOfferPurchased(email: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(email, "purchased"), "1");
  } catch {
    // silencieux
  }
}

export function clearWelcomeSampleOfferPurchased(email: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(email, "purchased"));
  } catch {
    // silencieux
  }
}

export function hasWelcomeSampleOfferFromSearchParam(
  searchParams: Pick<URLSearchParams, "get">
): boolean {
  return searchParams.get(WELCOME_SAMPLE_OFFER_QUERY_PARAM) === "1";
}

export function clearWelcomeSampleOfferSearchParam(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(WELCOME_SAMPLE_OFFER_QUERY_PARAM)) return;
  url.searchParams.delete(WELCOME_SAMPLE_OFFER_QUERY_PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function buildSignupWelcomeRedirectPath(): string {
  return AUTH_REDIRECT_SIGNUP_DEFAULT;
}
