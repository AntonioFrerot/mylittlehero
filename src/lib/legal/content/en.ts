import type { LegalPublisher } from "../publisher";
import type { LegalDocument, LegalDocumentSlug } from "../types";

const LAST_UPDATED = "30 May 2026";

function p(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

function buildMentionsLegales(pub: LegalPublisher): LegalDocument {
  return {
    slug: "mentions-legales",
    title: "Legal notice",
    description: `Legal notice for ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "Publisher",
        body: [
          `The website ${pub.siteUrl} is published by ${pub.companyName} (${pub.legalForm}), registered office: ${pub.registeredAddress}, SIRET: ${pub.siret}, RCS: ${pub.rcs}, VAT: ${pub.vatNumber}.`,
          `Publication director: ${pub.publisherDirector}. Contact: ${pub.contactEmail}.`,
        ],
      },
      {
        title: "Hosting",
        body: [`Hosted by ${pub.hostName}, ${pub.hostAddress}.`],
      },
      {
        title: "Consumer mediation",
        body: [
          `Mediator: ${pub.mediatorName} — ${pub.mediatorUrl} — ${pub.mediatorContact}.`,
          `Please contact ${pub.contactEmail} before referring a dispute to the mediator.`,
        ],
      },
    ],
  };
}

function buildConfidentialite(pub: LegalPublisher): LegalDocument {
  return {
    slug: "politique-de-confidentialite",
    title: "Privacy policy",
    description: `How ${pub.brandName} processes personal data (GDPR).`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "1. Data controller",
        body: [
          `${pub.companyName}, ${pub.registeredAddress}. Contact: ${pub.contactEmail}.`,
        ],
      },
      {
        title: "2. Data we collect",
        body: [
          `Account data (email, hashed password, optional name, language), child-related data you provide as legal guardian (name, age, height, face photo, optional notes), film creation preferences, order and subscription data, contact form messages, and technical logs.`,
          `We do not sell your data or use it for targeted advertising.`,
        ],
      },
      {
        title: "3. Purposes and legal bases",
        body: [
          `Contract performance (service delivery, account, billing), legitimate interests (security, support), and legal obligations. Child photos are provided only by a parent or legal guardian.`,
        ],
      },
      {
        title: "4. Processors",
        body: [
          `Stripe (payments), Vercel (hosting, database, file storage), OpenAI (story generation and support chat on text data you provide). Appropriate safeguards apply for transfers outside the EEA where required.`,
        ],
      },
      {
        title: "5. Your rights",
        body: [
          `You may request access, rectification, erasure, restriction, portability, or object to processing by emailing ${pub.contactEmail}. You may lodge a complaint with your supervisory authority (in France: CNIL).`,
        ],
      },
      {
        title: "6. Updates",
        body: [
          `We may update this policy; the latest version is published at ${p(pub.siteUrl, "/politique-de-confidentialite")}.`,
        ],
      },
    ],
  };
}

function buildCgv(pub: LegalPublisher): LegalDocument {
  return {
    slug: "cgv",
    title: "Terms of sale",
    description: `Terms applicable to purchases on ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "1. Scope",
        body: [
          `These terms govern sales of digital personalized films offered on ${pub.siteUrl} by ${pub.companyName}. Prices are shown in euros (EUR) including VAT where applicable.`,
        ],
      },
      {
        title: "2. Products",
        body: [
          `One-off purchases (ticket-based film credits) and monthly/yearly subscriptions as described on /achat and /creer. Delivery is digital via your customer account.`,
        ],
      },
      {
        title: "3. Order and payment",
        body: [
          `An account is required. Payment is processed by Stripe; we do not store card details. The contract is formed upon confirmed payment.`,
        ],
      },
      {
        title: "4. Right of withdrawal",
        body: [
          `EU consumers generally have 14 days to withdraw. For customized digital content where production has started at your express request, the right of withdrawal may not apply under French consumer law (Art. L221-28). Contact ${pub.contactEmail} for unused credits within 14 days.`,
        ],
      },
      {
        title: "5. Subscriptions",
        body: [
          `Subscriptions renew automatically unless cancelled before renewal. Cancellation takes effect at the end of the current billing period unless mandatory law provides otherwise.`,
        ],
      },
      {
        title: "6. Governing law",
        body: [
          `French law applies. Consumer mediation: ${pub.mediatorName} — ${pub.mediatorUrl}.`,
        ],
      },
    ],
  };
}

function buildCgu(pub: LegalPublisher): LegalDocument {
  return {
    slug: "cgu",
    title: "Terms of use",
    description: `Rules for using ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "1. Acceptance",
        body: [
          `By creating an account or using the service, you accept these terms, our terms of sale (${p(pub.siteUrl, "/cgv")}), and privacy policy (${p(pub.siteUrl, "/politique-de-confidentialite")}).`,
        ],
      },
      {
        title: "2. Eligibility",
        body: [
          `The service is for adults (18+) acting as parent or legal guardian. You are responsible for uploaded content and account security.`,
        ],
      },
      {
        title: "3. Intellectual property",
        body: [
          `You retain rights in content you upload and grant us a license to produce and deliver your film. Delivered films are for personal, non-commercial family use unless otherwise agreed in writing.`,
        ],
      },
      {
        title: "4. AI-generated content",
        body: [
          `Parts of the story may be generated automatically. Results may vary. Please review films before showing them to children and report technical issues to ${pub.contactEmail}.`,
        ],
      },
      {
        title: "5. Liability",
        body: [
          `Our liability is limited to direct damages up to amounts paid in the last 12 months, except where law prohibits such limitation.`,
        ],
      },
    ],
  };
}

function buildCookies(pub: LegalPublisher): LegalDocument {
  return {
    slug: "politique-cookies",
    title: "Cookie policy",
    description: `Cookies used by ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "1. Cookies we use",
        body: [
          `Strictly necessary cookies only: ph_session (login, 30 days) and mlh_locale (language preference, 1 year).`,
        ],
      },
      {
        title: "2. Third parties",
        body: [
          `Stripe may set cookies during checkout. Example pages may embed YouTube videos. We do not currently use analytics or advertising cookies on the site.`,
        ],
      },
      {
        title: "3. Contact",
        body: [`Questions: ${pub.contactEmail}.`],
      },
    ],
  };
}

const BUILDERS: Record<
  LegalDocumentSlug,
  (pub: LegalPublisher) => LegalDocument
> = {
  "mentions-legales": buildMentionsLegales,
  "politique-de-confidentialite": buildConfidentialite,
  cgv: buildCgv,
  cgu: buildCgu,
  "politique-cookies": buildCookies,
};

export function getEnglishLegalDocument(
  slug: LegalDocumentSlug,
  publisher: LegalPublisher
): LegalDocument {
  return BUILDERS[slug](publisher);
}
