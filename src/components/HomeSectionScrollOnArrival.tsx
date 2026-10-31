"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { runPendingHomeSectionScroll } from "@/lib/scroll-to-section";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}

/** Renfort quand le contenu accueil vient d’être monté (streaming RSC). */
export function HomeSectionScrollOnArrival() {
  const pathname = usePathname();

  useEffect(() => {
    if (normalizePath(pathname || "/") !== "/") return;
    return runPendingHomeSectionScroll();
  }, [pathname]);

  return null;
}
