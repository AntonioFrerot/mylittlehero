export const BRAND_NAME = "MyLittleHero";

/** Bump ?v= when replacing the logo file (browser / Next.js Image cache). */
export const SITE_LOGO_SRC = "/brand/logo.png?v=7";

/** Bump ?v= when replacing the ticket icon. */
export const SITE_TICKET_SRC = "/brand/ticket.png?v=2";

export function pageTitle(pageLabel: string): string {
  return `${pageLabel} — ${BRAND_NAME}`;
}
