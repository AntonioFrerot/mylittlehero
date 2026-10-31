"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearPendingHomeSectionScroll,
  peekPendingHomeSectionScroll,
  scrollToSectionWhenReady,
} from "@/lib/scroll-to-section";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}

/** Défilement vers #themes / #comment-ca-marche une fois le contenu accueil monté. */
export function HomeSectionScrollOnArrival() {
  const pathname = usePathname();

  useEffect(() => {
    if (normalizePath(pathname || "/") !== "/") return;

    const fromHash = window.location.hash.replace(/^#/, "");
    const id = fromHash || peekPendingHomeSectionScroll();
    if (!id) return;

    return scrollToSectionWhenReady(id, "smooth", {
      onSuccess: () => clearPendingHomeSectionScroll(),
    });
  }, [pathname]);

  return null;
}
