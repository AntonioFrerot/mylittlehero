export type Character = {
  id: string;
  prenom: string;
  photoSrc: string;
  audioSrc?: string;
  age?: string;
  taille: string;
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
};

/** Ancien format (migration automatique à la lecture). */
export type LegacyCharacter = {
  id: string;
  name?: string;
  prenom?: string;
  photoSrc?: string;
  audioSrc?: string;
  role?: string;
  description?: string;
  age?: string;
  taille?: string;
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
};
