import type { UserFilm } from "@/lib/film-creation/types";

export type UserFilmPageMediaState = {
  showPosterPlaceholder: boolean;
  showInCreationMedia: boolean;
  showVideoMedia: boolean;
  posterSrc: string | undefined;
};

/** Affiche / vidéo admin déjà livrés par l'équipe (pas les photos personnages). */
export function resolveUserFilmPageMedia(
  film: UserFilm,
  isFreeTrial: boolean
): UserFilmPageMediaState {
  if (isFreeTrial) {
    const hasAdminVideo = Boolean(film.videoSrc?.trim());

    return {
      showPosterPlaceholder: !hasAdminVideo,
      showInCreationMedia: !hasAdminVideo,
      showVideoMedia: hasAdminVideo,
      posterSrc: undefined,
    };
  }

  const hasAdminPoster = Boolean(film.posterSrc?.trim());
  const hasAdminVideo = Boolean(film.videoSrc?.trim());

  return {
    showPosterPlaceholder: !hasAdminPoster,
    showInCreationMedia: !hasAdminVideo,
    showVideoMedia:
      hasAdminVideo &&
      Boolean(film.posterSrc?.trim() || film.videoPosterSrc?.trim()),
    posterSrc: film.posterSrc,
  };
}
