export const CREER_FILM_PATH = "/creer-film";

export const PRICING_PATH = "/achat";

export const CREER_FILM_CONNEXION_REDIRECT =
  "/connexion?redirect=%2Fcreer-film";

export type CreateFilmEligibility = {
  balance: number;
  jetonBalance: number;
  hasActiveSubscription: boolean;
  freeFilmAvailable: boolean;
};

export function getCreerSonFilmHref(isLoggedIn: boolean): string {
  return isLoggedIn ? CREER_FILM_PATH : CREER_FILM_CONNEXION_REDIRECT;
}

export function canCreateFilm(summary: CreateFilmEligibility): boolean {
  return (
    summary.hasActiveSubscription ||
    summary.freeFilmAvailable ||
    summary.balance > 0 ||
    summary.jetonBalance > 0
  );
}

export function shouldShowNoCreditsNotice(
  summary: Pick<
    CreateFilmEligibility,
    "balance" | "jetonBalance" | "hasActiveSubscription"
  >
): boolean {
  return (
    summary.balance === 0 &&
    summary.jetonBalance === 0 &&
    !summary.hasActiveSubscription
  );
}
