/** Limites alignées sur `saveCharacterPhoto` / `saveCharacterAudio`. */
export const CHARACTER_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const CHARACTER_AUDIO_MAX_BYTES = 2 * 1024 * 1024;

/** Limite Server Action (photo + audio + champs du formulaire) — voir `next.config.ts`. */
export const CHARACTER_SERVER_ACTION_BODY_LIMIT = "10mb";
