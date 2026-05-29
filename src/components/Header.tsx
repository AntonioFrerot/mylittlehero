"use client";



import Link from "next/link";

import { HashLink } from "@/components/ui/HashLink";

import { useEffect, useState } from "react";
import type React from "react";

import { HeaderAuth, MobileAuthLinks } from "@/components/auth/HeaderAuth";

import { useLocale } from "@/components/LocaleProvider";

import { BRAND_NAME } from "@/lib/brand";
import { scrollToSection } from "@/lib/scroll-to-section";
import { usePathname } from "next/navigation";



const navLinkKeys = [

  { href: "/#comment-ca-marche", key: "nav.howItWorks" as const },

  { href: "/#themes", key: "nav.themes" as const },

  { href: "/contact", key: "nav.contact" as const },

  { href: "/creer", key: "nav.pricing" as const },

  { href: "/achat", key: "nav.purchase" as const },

];



export function Header() {

  const { t } = useLocale();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollLockY, setScrollLockY] = useState(0);

  const handleMobileNavigate = (href: string) => (event: React.MouseEvent) => {
    // Ferme d'abord le menu (important: body est figé quand menuOpen=true).
    setMenuOpen(false);

    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    const targetPath = href.slice(0, hashIndex) || "/";
    const targetId = href.slice(hashIndex + 1);
    if (!targetId) return;

    // Si on est déjà sur la home, on scroll après fermeture du menu.
    if ((pathname || "/") === "/" && (targetPath === "" || targetPath === "/")) {
      event.preventDefault();
      // Laisser React appliquer le changement d'état + restaurer le scroll du body,
      // puis déclencher le scroll vers l'ancre.
      setTimeout(() => scrollToSection(targetId, "smooth"), 0);
    }
  };



  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);

  }, []);



  useEffect(() => {

    if (menuOpen) {
      const y = window.scrollY;
      setScrollLockY(y);
      // iOS: overflow hidden sur body n'est pas suffisant → on fige le body.
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

          ? `border-b border-white/5 ${menuOpen ? "bg-cinema-night" : "bg-cinema-night/95"} shadow-lg shadow-black/30 ${menuOpen ? "" : "backdrop-blur-xl"}`

          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent backdrop-blur-[2px]"

      }`}

      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}

    >

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:grid md:h-16 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4 md:px-8 lg:px-10">

        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2"
          onClick={(event) => {
            if (!menuOpen) return;
            if ((pathname || "/") === "/") {
              event.preventDefault();
              setMenuOpen(false);
              return;
            }
            setMenuOpen(false);
          }}
        >

          <span

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-dark to-gold-light text-lg shadow-glow-gold"

            aria-hidden

          >

            ✦

          </span>

          <span className="truncate font-display text-base font-semibold tracking-tight text-cream sm:text-lg md:text-xl">

            MyLittle<span className="text-gold-light">Hero</span>

            <span className="sr-only">{BRAND_NAME}</span>

          </span>

        </Link>



        <nav

          className="hidden items-center justify-center gap-4 md:flex lg:gap-8"

          aria-label="Navigation principale"

        >

          {navLinkKeys.map((link) => {
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

        </nav>



        <div className="hidden md:block">

          <HeaderAuth />

        </div>



        <button

          type="button"

          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 text-cream md:hidden"

          aria-expanded={menuOpen}

          aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}

          onClick={() => setMenuOpen((open) => !open)}

        >

          {menuOpen ? (

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

              <path d="M6 6l12 12M18 6L6 18" />

            </svg>

          ) : (

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

              <path d="M4 7h16M4 12h16M4 17h16" />

            </svg>

          )}

        </button>

      </div>



      {menuOpen && (
        <div className="fixed inset-0 z-[60] pointer-events-none md:hidden">
          <div
            className="pointer-events-auto absolute inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] bg-black/30"
            role="presentation"
            aria-label={t("nav.closeMenu")}
            onPointerDown={() => setMenuOpen(false)}
            onTouchMove={() => setMenuOpen(false)}
            onWheel={() => setMenuOpen(false)}
          />

          <div
            className="pointer-events-auto absolute inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-y-auto border-t border-white/5 bg-cinema-night px-4 py-4"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
              {navLinkKeys.map((link) => {
                const NavLink = link.href.includes("#") ? HashLink : Link;
                return (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3.5 text-base text-cream/85 active:bg-white/5 hover:bg-white/5 hover:text-gold-light"
                    onClick={handleMobileNavigate(link.href)}
                  >
                    {t(link.key)}
                  </NavLink>
                );
              })}

              <MobileAuthLinks onNavigate={() => setMenuOpen(false)} />
            </nav>
          </div>
        </div>
      )}

    </header>

  );

}


