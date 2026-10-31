"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearPendingHomeSectionScroll,
  consumePendingHomeSectionScroll,
  scrollToSectionWhenReady,
} from "@/lib/scroll-to-section";

/** Scroll vers l’ancre après navigation client (ex. menu depuis /catalogue). */
export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (normalizePath(pathname || "/") !== "/") return;

    const fromHash = window.location.hash.replace(/^#/, "");
    if (fromHash) {
      clearPendingHomeSectionScroll();
    }
    const id = fromHash || consumePendingHomeSectionScroll() || "";
    if (!id) return;

    const cancel = scrollToSectionWhenReady(id);
    return cancel;
  }, [pathname]);

  return null;
}

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}
