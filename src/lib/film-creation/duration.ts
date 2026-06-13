export const FILM_DURATION_MIN_SECONDS = 2 * 60;
export const FILM_DURATION_MAX_SECONDS = 10 * 60;
export const FILM_DURATION_STEP_SECONDS = 15;

export function buildFilmDurationOptions(): number[] {
  const options: number[] = [];
  for (
    let seconds = FILM_DURATION_MIN_SECONDS;
    seconds <= FILM_DURATION_MAX_SECONDS;
    seconds += FILM_DURATION_STEP_SECONDS
  ) {
    options.push(seconds);
  }
  return options;
}

export const FILM_DURATION_OPTIONS = buildFilmDurationOptions();

export function isValidFilmDurationSeconds(seconds: number): boolean {
  return (
    Number.isFinite(seconds) &&
    seconds >= FILM_DURATION_MIN_SECONDS &&
    seconds <= FILM_DURATION_MAX_SECONDS &&
    (seconds - FILM_DURATION_MIN_SECONDS) % FILM_DURATION_STEP_SECONDS === 0
  );
}

export function getFilmDurationSeconds(film: {
  durationSeconds?: number;
  durationMinutes?: number;
}): number | undefined {
  if (
    film.durationSeconds != null &&
    isValidFilmDurationSeconds(film.durationSeconds)
  ) {
    return film.durationSeconds;
  }
  if (film.durationMinutes != null && film.durationMinutes > 0) {
    return film.durationMinutes * 60;
  }
  return undefined;
}

export function formatFilmDurationSeconds(
  totalSeconds: number,
  locale: "fr" | "en" = "fr"
): string {
  if (totalSeconds < 60) {
    return locale === "en" ? `${totalSeconds} sec` : `${totalSeconds} sec`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return locale === "en" ? `${minutes} min` : `${minutes} min`;
  }

  const padded = String(seconds).padStart(2, "0");
  return locale === "en"
    ? `${minutes} min ${padded}`
    : `${minutes} min ${padded}`;
}
