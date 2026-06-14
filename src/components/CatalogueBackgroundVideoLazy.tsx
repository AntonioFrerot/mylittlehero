"use client";

import dynamic from "next/dynamic";

const CatalogueBackgroundVideo = dynamic(
  () =>
    import("@/components/CatalogueBackgroundVideo").then(
      (module) => module.CatalogueBackgroundVideo
    ),
  { ssr: false }
);

export function CatalogueBackgroundVideoLazy() {
  return <CatalogueBackgroundVideo />;
}
