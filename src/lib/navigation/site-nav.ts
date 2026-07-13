import type { TranslationKey } from "@/lib/i18n/translator";
import { ABONNEMENTS_PRICING_PATH } from "@/lib/navigation/subscription-pricing";

export type SiteNavLink = {
  href: string;
  key: TranslationKey;
};

export const SITE_NAV_LINKS: SiteNavLink[] = [
  { href: "/#comment-ca-marche", key: "nav.howItWorks" },
  { href: "/#themes", key: "nav.themes" },
  { href: "/catalogue", key: "nav.catalog" },
  { href: "/contact", key: "nav.contact" },
  { href: ABONNEMENTS_PRICING_PATH, key: "nav.purchase" },
];

export function isSiteNavLinkActive(
  href: string,
  pathname: string,
  hash: string
): boolean {
  const normalizedPath = pathname || "/";
  const hashIndex = href.indexOf("#");

  if (hashIndex !== -1) {
    const linkPath = href.slice(0, hashIndex) || "/";
    const targetId = href.slice(hashIndex + 1);
    const onLinkPath =
      linkPath === "/" ? normalizedPath === "/" : normalizedPath === linkPath;
    return onLinkPath && hash === targetId;
  }

  return (
    normalizedPath === href || normalizedPath.startsWith(`${href}/`)
  );
}
