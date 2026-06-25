/** Photos uploadées — servies via l'optimiseur Next.js (WebP/AVIF + taille d'affichage). */
export function isBlobPreviewPhoto(photoSrc: string): boolean {
  return photoSrc.startsWith("blob:");
}

/** @deprecated Utiliser isBlobPreviewPhoto — seules les prévisualisations blob: restent non optimisées. */
export function isUserCharacterPhoto(photoSrc: string): boolean {
  return (
    photoSrc.startsWith("/uploads/") ||
    photoSrc.includes("blob.vercel-storage.com")
  );
}

/** Taille d'affichage CSS (Next.js applique le ratio pixel device). */
export const CHARACTER_PICKER_AVATAR_SIZES = "(max-width: 639px) 120px, 192px";

export const CHARACTER_AVATAR_IMAGE_QUALITY = 92;
