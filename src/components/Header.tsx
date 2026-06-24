"use client";

import Link from "next/link";
import Image from "next/image";
import { HashLink } from "@/components/ui/HashLink";
import { useEffect, useState } from "react";
import { HeaderAuth } from "@/components/auth/HeaderAuth";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { HeaderTicketCount } from "@/components/tickets/HeaderTicketCount";
import { useAuthUser, useIsAdmin } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import { BRAND_NAME, SITE_LOGO_SRC } from "@/lib/brand";
import { SITE_NAV_LINKS } from "@/lib/navigation/site-nav";
import { BTN_3D_ICON } from "@/lib/ui/button-3d-classes";
import { usePathname } from "next/navigation";

export function Header() {
  const { t } = useLocale();
  const user = useAuthUser();
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollLockY, setScrollLockY] = useState(0);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      const y = window.scrollY;
      setScrollLockY(y);
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
      if (scrollLockY) window.scrollTo(0, scrollLockY);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen, scrollLockY]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? `border-b border-white/5 ${menuOpen ? "bg-cinema-night" : "max-md:bg-cinema-night md:bg-cinema-night/95"} shadow-lg shadow-black/30 ${menuOpen ? "" : "md:backdrop-blur-xl"}`
          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent backdrop-blur-[2px]"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:grid md:h-16 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4 md:px-8 lg:px-10">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-1"
          onClick={(event) => {
            if (!menuOpen) return;
            if ((pathname || "/") === "/") {
              event.preventDefault();
              closeMenu();
              return;
            }
            closeMenu();
          }}
        >
          <Image
            src={SITE_LOGO_SRC}
            alt=""
            width={44}
            height={44}
            className="h-10 w-10 shrink-0 object-contain md:h-11 md:w-11"
            priority
          />
          <span className="-ml-px truncate font-display text-base font-semibold tracking-tight text-cream sm:text-lg md:text-xl">
            MyLittle<span className="text-gold-light">Hero</span>
            <span className="sr-only">{BRAND_NAME}</span>
          </span>
        </Link>

        <nav
          className="hidden items-center justify-center gap-4 md:flex lg:gap-8"
          aria-label="Navigation principale"
        >
          {SITE_NAV_LINKS.map((link) => {
            const NavLink = link.href.includes("#") ? HashLink : Link;
            return (
              <NavLink
                key={link.href}
                href={link.href}
                className="text-sm text-cream/70 transition-colors hover:text-gold-light"
              >
                {t(link.key)}
              </NavLink>
            );
          })}
          {isAdmin ? (
            <Link
              href="/admin"
              className="text-sm text-cream/70 transition-colors hover:text-gold-light"
            >
              {t("nav.admin")}
            </Link>
          ) : null}
        </nav>

        <div className="hidden md:block">
          <HeaderAuth />
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {user ? <HeaderTicketCount className="header-ticket-count--mobile" /> : null}
          <button
            type="button"
            className={`${BTN_3D_ICON} h-11 w-11 rounded-lg text-cream`}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] pointer-events-none md:hidden">
          <div
            className="pointer-events-auto absolute inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] bg-black/40"
            role="presentation"
            aria-label={t("nav.closeMenu")}
            onPointerDown={closeMenu}
            onTouchMove={closeMenu}
            onWheel={closeMenu}
          />

          <div
            id="mobile-nav-panel"
            className="mobile-nav-panel pointer-events-auto absolute inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-y-auto border-t border-white/5 bg-cinema-night px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <nav aria-label="Navigation mobile">
              <MobileNavMenu onNavigate={closeMenu} />
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
