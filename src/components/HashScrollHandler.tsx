"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearPendingHomeSectionScroll,
  peekPendingHomeSectionScroll,
  scrollToSectionWhenReady,
} from "@/lib/scroll-to-section";

/** Scroll vers l’ancre après navigation client (ex. menu depuis /catalogue). */
export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (normalizePath(pathname || "/") !== "/") return;

    let cancelScroll: (() => void) | undefined;
    let outerFrame = 0;
    let innerFrame = 0;

    const run = () => {
      const fromHash = window.location.hash.replace(/^#/, "");
      const id = fromHash || peekPendingHomeSectionScroll() || "";
      if (!id) return;
      cancelScroll = scrollToSectionWhenReady(id, "smooth", {
        onSuccess: () => clearPendingHomeSectionScroll(),
      });
    };

    outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(run);
    });

    return () => {
      if (outerFrame) cancelAnimationFrame(outerFrame);
      if (innerFrame) cancelAnimationFrame(innerFrame);
      cancelScroll?.();
    };
  }, [pathname]);

  useEffect(() => {
    if (normalizePath(pathname || "/") !== "/") return;

    function handleHashChange() {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      scrollToSectionWhenReady(id, "smooth", {
        onSuccess: () => clearPendingHomeSectionScroll(),
      });
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  return null;
}

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}
