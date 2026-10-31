"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  HOME_SECTION_SCROLL_EVENT,
  type HomeSectionScrollDetail,
  runPendingHomeSectionScroll,
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
      cancelScroll?.();
      cancelScroll = runPendingHomeSectionScroll();
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
    function handleScrollRequest(event: Event) {
      const detail = (event as CustomEvent<HomeSectionScrollDetail>).detail;
      runPendingHomeSectionScroll(detail?.id);
    }

    window.addEventListener(HOME_SECTION_SCROLL_EVENT, handleScrollRequest);
    return () => {
      window.removeEventListener(HOME_SECTION_SCROLL_EVENT, handleScrollRequest);
    };
  }, []);

  useEffect(() => {
    if (normalizePath(pathname || "/") !== "/") return;

    function handleHashChange() {
      runPendingHomeSectionScroll();
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
