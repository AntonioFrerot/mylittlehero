import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_EMAIL } from "@/lib/contact/constants";
import { getSiteUrl } from "@/lib/stripe/site-url";

const PLACEHOLDER = "[À COMPLÉTER]";

export type LegalPublisher = {
  brandName: string;
  companyName: string;
  legalForm: string;
  shareCapital: string;
  registeredAddress: string;
  siret: string;
  rcs: string;
  vatNumber: string;
  publisherDirector: string;
  contactEmail: string;
  contactPhone: string;
  hostName: string;
  hostAddress: string;
  mediatorName: string;
  mediatorUrl: string;
  mediatorContact: string;
  siteUrl: string;
};

function envOrPlaceholder(key: string, fallback = PLACEHOLDER): string {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : fallback;
}

function envOrDefault(key: string, defaultValue: string): string {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : defaultValue;
}

/** Micro-entreprise / auto-entrepreneur — pas de capital social ni RCS dans la plupart des cas. */
export function isMicroEntreprise(publisher: LegalPublisher): boolean {
  const form = publisher.legalForm.toLowerCase();
  return (
    form.includes("micro") ||
    form.includes("auto-entrepreneur") ||
    form.includes("auto entrepreneur") ||
    form.includes("entreprise individuelle")
  );
}

/** Identité juridique — compléter via variables d'environnement avant vente en France. */
export function getLegalPublisher(): LegalPublisher {
  const legalForm = envOrDefault("LEGAL_FORM", "Micro-entreprise");

  return {
    brandName: BRAND_NAME,
    companyName: envOrPlaceholder("LEGAL_COMPANY_NAME"),
    legalForm,
    shareCapital: envOrDefault(
      "LEGAL_SHARE_CAPITAL",
      "Non applicable (micro-entreprise)"
    ),
    registeredAddress: envOrPlaceholder("LEGAL_ADDRESS"),
    siret: envOrPlaceholder("LEGAL_SIRET"),
    rcs: envOrDefault(
      "LEGAL_RCS",
      "Non inscrit au RCS (activité non commerciale ou micro-entrepreneur)"
    ),
    vatNumber: envOrDefault(
      "LEGAL_VAT_NUMBER",
      "TVA non applicable, article 293 B du CGI"
    ),
    publisherDirector: envOrPlaceholder("LEGAL_PUBLISHER_DIRECTOR"),
    contactEmail: CONTACT_EMAIL,
    contactPhone: envOrPlaceholder("LEGAL_PHONE", "Non communiqué"),
    hostName: "Vercel Inc.",
    hostAddress: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    mediatorName: envOrPlaceholder("LEGAL_MEDIATOR_NAME"),
    mediatorUrl: envOrPlaceholder("LEGAL_MEDIATOR_URL"),
    mediatorContact: envOrPlaceholder("LEGAL_MEDIATOR_CONTACT"),
    siteUrl: getSiteUrl(),
  };
}

export function isLegalPublisherComplete(publisher: LegalPublisher): boolean {
  const required: (keyof LegalPublisher)[] = [
    "companyName",
    "registeredAddress",
    "siret",
    "publisherDirector",
    "mediatorName",
    "mediatorUrl",
  ];
  return required.every((key) => {
    const value = publisher[key];
    return typeof value === "string" && !value.includes(PLACEHOLDER);
  });
}
