import { getSession } from "@/lib/auth/get-session";
import { getMyFilmTicketSummary } from "@/lib/purchases/actions";
import {
  canCreateFilm,
  CREER_FILM_CONNEXION_REDIRECT,
  CREER_FILM_PATH,
  PRICING_PATH,
} from "./creer-film";

export async function resolveCreerSonFilmHref(): Promise<string> {
  const session = await getSession();
  if (!session) return CREER_FILM_CONNEXION_REDIRECT;

  const summary = await getMyFilmTicketSummary();
  if (!summary || canCreateFilm(summary)) return CREER_FILM_PATH;

  return PRICING_PATH;
}
