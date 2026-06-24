export const BRAND_NAME = "MyLittleHero";

/** Bump ?v= when replacing the logo file (browser / Next.js Image cache). */
export const SITE_LOGO_SRC = "/brand/logo.png?v=7";

/** Bump ?v= when replacing favicon assets. */
export const SITE_FAVICON_16_SRC = "/brand/favicon-16.png?v=1";
export const SITE_FAVICON_32_SRC = "/brand/favicon-32.png?v=1";
export const SITE_APPLE_ICON_SRC = "/brand/apple-touch-icon.png?v=1";

/** Bump ?v= when replacing the ticket icon. */
export const SITE_TICKET_SRC = "/brand/ticket.png?v=8";

export function pageTitle(pageLabel: string): string {
  return `${pageLabel} — ${BRAND_NAME}`;
}
