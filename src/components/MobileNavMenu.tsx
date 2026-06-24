"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileAuthLinks } from "@/components/auth/HeaderAuth";
import { useIsAdmin } from "@/components/auth/AuthProvider";
import { HashLink } from "@/components/ui/HashLink";
import { useLocale } from "@/components/LocaleProvider";
import {
  isSiteNavLinkActive,
  SITE_NAV_LINKS,
} from "@/lib/navigation/site-nav";
import { scrollToSection } from "@/lib/scroll-to-section";

type MobileNavMenuProps = {
  onNavigate: () => void;
};

function NavChevron() {
  return (
    <svg
      className="mobile-nav-link__chevron size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function MobileNavMenu({ onNavigate }: MobileNavMenuProps) {
  const { t } = useLocale();
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash.replace(/^#/, ""));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const handleLinkClick =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      onNavigate();

      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const targetPath = href.slice(0, hashIndex) || "/";
      const targetId = href.slice(hashIndex + 1);
      if (!targetId) return;

      if (
        (pathname || "/") === "/" &&
        (targetPath === "" || targetPath === "/")
      ) {
        event.preventDefault();
        setTimeout(() => scrollToSection(targetId, "smooth"), 0);
      }
    };

  return (
    <>
      <ul className="mobile-nav-list">
        {SITE_NAV_LINKS.map((link) => {
          const NavLink = link.href.includes("#") ? HashLink : Link;
          const active = isSiteNavLinkActive(
            link.href,
            pathname || "/",
            hash
          );

          return (
            <li key={link.href}>
              <NavLink
                href={link.href}
                className={`mobile-nav-link${active ? " mobile-nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={handleLinkClick(link.href)}
              >
                <span>{t(link.key)}</span>
                <NavChevron />
              </NavLink>
            </li>
          );
        })}
        {isAdmin ? (
          <li>
            <Link
              href="/admin"
              className={`mobile-nav-link${pathname === "/admin" ? " mobile-nav-link--active" : ""}`}
              aria-current={pathname === "/admin" ? "page" : undefined}
              onClick={() => onNavigate()}
            >
              <span>{t("nav.admin")}</span>
              <NavChevron />
            </Link>
          </li>
        ) : null}
      </ul>

      <div className="mobile-nav-actions">
        <MobileAuthLinks onNavigate={onNavigate} />
      </div>
    </>
  );
}
