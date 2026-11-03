import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import { createTranslator } from "./translator";

/** Version de l’image de partage — incrémenter pour invalider le cache Discord / réseaux. */
const SHARE_IMAGE_PATH = "/brand/logo.png?v=9";

const shareImage = {
  url: SHARE_IMAGE_PATH,
  width: 512,
  height: 512,
  alt: BRAND_NAME,
};

/** Métadonnées publiques (SEO, Discord, etc.) — toujours en français. */
export function buildFrenchShareMetadata(options: {
  title: string;
  description?: string;
  path?: string;
  robots?: Metadata["robots"];
}): Metadata {
  const t = createTranslator("fr");
  const description = options.description ?? t("meta.description");
  const siteUrl = getSiteUrl();
  const url = options.path
    ? `${siteUrl}${options.path.startsWith("/") ? options.path : `/${options.path}`}`
    : siteUrl;
  const title = options.title.includes(BRAND_NAME)
    ? options.title
    : `${options.title} — ${BRAND_NAME}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    ...(options.robots ? { robots: options.robots } : {}),
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: BRAND_NAME,
      title,
      description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE_PATH],
    },
  };
}

export function buildFrenchRootMetadata(): Metadata {
  const t = createTranslator("fr");
  return buildFrenchShareMetadata({
    title: `${BRAND_NAME} — ${t("meta.title")}`,
    description: t("meta.description"),
  });
}
