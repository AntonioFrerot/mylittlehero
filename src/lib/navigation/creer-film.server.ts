import { getSession } from "@/lib/auth/get-session";
import { getCreerSonFilmHref } from "@/lib/navigation/creer-film";

/** Lien CTA sans requêtes DB : la page /creer-film gère l'éligibilité. */
export async function resolveCreerSonFilmHref(): Promise<string> {
  const session = await getSession();
  return getCreerSonFilmHref(Boolean(session));
}
