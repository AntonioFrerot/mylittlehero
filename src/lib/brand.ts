export const BRAND_NAME = "MyLittleHero";

/** Bump ?v= when replacing the logo file (browser / Next.js Image cache). */
export const SITE_LOGO_SRC = "/brand/logo.png?v=6";

export function pageTitle(pageLabel: string): string {
  return `${pageLabel} — ${BRAND_NAME}`;
}
