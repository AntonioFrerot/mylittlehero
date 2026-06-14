"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { ThemesCarousel } from "@/components/ThemesCarousel";

const ThemesCarouselClient = dynamic(
  () =>
    import("@/components/ThemesCarousel").then((module) => module.ThemesCarousel),
  {
    loading: () => (
      <div
        className="h-48 animate-pulse rounded-2xl bg-white/5 md:h-56"
        aria-hidden
      />
    ),
  }
);

export function ThemesCarouselLazy(
  props: ComponentProps<typeof ThemesCarousel>
) {
  return <ThemesCarouselClient {...props} />;
}
