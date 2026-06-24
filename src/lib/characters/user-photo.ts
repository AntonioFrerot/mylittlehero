/** Photos uploadées par l'utilisateur — servies telles quelles pour éviter la double compression. */
export function isUserCharacterPhoto(photoSrc: string): boolean {
  return (
    photoSrc.startsWith("/uploads/") ||
    photoSrc.includes("blob.vercel-storage.com")
  );
}

/** Taille d'affichage CSS (Next.js applique le ratio pixel device). */
export const CHARACTER_PICKER_AVATAR_SIZES = "(max-width: 639px) 120px, 192px";

export const CHARACTER_AVATAR_IMAGE_QUALITY = 92;
