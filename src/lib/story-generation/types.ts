import type { UserFilm } from "@/lib/film-creation/types";

export type StoryGenerationStatus =
  | "awaiting_generation"
  | "generating"
  | "completed"
  | "failed";

export type StoryWorkspaceManifest = {
  filmId: string;
  email: string;
  createdAt: string;
  style: UserFilm["style"];
  themes: UserFilm["themes"];
  durationSeconds: number;
  sceneCount: number;
  language?: UserFilm["language"];
  avoid: string;
  additionalInfo?: string;
  characters: UserFilm["characters"];
  provisionalTitle: string;
  promptPath: string;
  status: StoryGenerationStatus;
  generatedTitle?: string;
  generationError?: string;
  generationCompletedAt?: string;
  generationMode?: "openai" | "mock";
  /** Début du délai de 5 min avant rappel de validation (création ou régénération). */
  validationReminderStartedAt?: string;
  /** Le client a validé le titre et le résumé — le film peut être produit. */
  storyValidatedAt?: string;
  /** Une seule régénération autorisée avant validation. */
  regenerationUsed?: boolean;
};
