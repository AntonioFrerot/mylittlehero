export const MIN_CHARACTER_AUDIO_SECONDS = 3;
export const MAX_CHARACTER_AUDIO_SECONDS = 15;

export function isValidCharacterAudioDuration(seconds: number): boolean {
  return (
    Number.isFinite(seconds) &&
    seconds >= MIN_CHARACTER_AUDIO_SECONDS &&
    seconds <= MAX_CHARACTER_AUDIO_SECONDS
  );
}
