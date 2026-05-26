export const CREER_FILM_PATH = "/creer-film";

export const CREER_FILM_CONNEXION_REDIRECT =
  "/connexion?redirect=%2Fcreer-film";

export function getCreerSonFilmHref(isLoggedIn: boolean): string {
  return isLoggedIn ? CREER_FILM_PATH : CREER_FILM_CONNEXION_REDIRECT;
}
