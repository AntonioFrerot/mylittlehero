"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { scrollToLocationHash } from "@/lib/scroll-to-section";

/** Scroll vers l’ancre après navigation client (ex. retour depuis une page film). */
export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.location.hash) return;
    const timer = window.setTimeout(() => scrollToLocationHash(), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
