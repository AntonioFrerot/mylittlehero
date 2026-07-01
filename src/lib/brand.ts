export const BRAND_NAME = "MyLittleHero";

/** Bump ?v= when replacing the logo file (browser / Next.js Image cache). */
export const SITE_LOGO_SRC = "/brand/logo.png?v=8";

/** Bump ?v= when replacing favicon assets. */
export const SITE_FAVICON_16_SRC = "/brand/favicon-16.png?v=1";
export const SITE_FAVICON_32_SRC = "/brand/favicon-32.png?v=1";
export const SITE_APPLE_ICON_SRC = "/brand/apple-touch-icon.png?v=1";

/** Bump ?v= when replacing the ticket icon. */
export const SITE_TICKET_SRC = "/brand/ticket.png?v=9";
/** Dimensions 2× pour l'optimiseur Next.js (affichage CSS ~28px de haut). */
export const SITE_TICKET_IMAGE_WIDTH = 87;
export const SITE_TICKET_IMAGE_HEIGHT = 112;

/** Ticket 3D — page /tarifs (cartes packs). */
export const SITE_TICKET_TARIFS_SRC = "/brand/ticket-tarifs.png?v=1";
export const SITE_TICKET_TARIFS_WIDTH = 500;
export const SITE_TICKET_TARIFS_HEIGHT = 500;

export function pageTitle(pageLabel: string): string {
  return `${pageLabel} — ${BRAND_NAME}`;
}
