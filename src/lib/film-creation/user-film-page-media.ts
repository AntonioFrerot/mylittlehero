import type { UserFilm } from "@/lib/film-creation/types";

export type UserFilmPageMediaState = {
  /** Affiche floutée + « ? » tant que l'admin n'a pas envoyé l'affiche. */
  showPosterPlaceholder: boolean;
  /** Miniature floutée « En cours de création... » tant que l'admin n'a pas envoyé la vidéo. */
  showInCreationMedia: boolean;
  /** Lecteur vidéo une fois la vidéo livrée par l'admin. */
  showVideoMedia: boolean;
  posterSrc: string | undefined;
};

/**
 * Médias page film utilisateur : placeholders automatiques à la création,
 * remplacés uniquement par les assets envoyés par l'admin (affiche / vidéo).
 */
export function resolveUserFilmPageMedia(
  film: UserFilm,
  isFreeTrial: boolean
): UserFilmPageMediaState {
  const hasAdminPoster = Boolean(film.posterSrc?.trim());
  const hasDeliveredVideo = Boolean(film.videoSrc?.trim());

  if (isFreeTrial) {
    return {
      showPosterPlaceholder: false,
      showInCreationMedia: false,
      showVideoMedia: false,
      posterSrc: undefined,
    };
  }

  return {
    showPosterPlaceholder: !hasAdminPoster,
    showInCreationMedia: !hasDeliveredVideo,
    showVideoMedia:
      hasDeliveredVideo &&
      Boolean(film.posterSrc?.trim() || film.videoPosterSrc?.trim()),
    posterSrc: film.posterSrc,
  };
}
