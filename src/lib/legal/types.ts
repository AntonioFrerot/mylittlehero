export type LegalListBlock = {
  type: "ul" | "ol";
  items: string[];
};

export type LegalSection = {
  id?: string;
  title: string;
  body: (string | LegalListBlock)[];
};

export type LegalDocument = {
  slug: LegalDocumentSlug;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export type LegalDocumentSlug =
  | "mentions-legales"
  | "politique-de-confidentialite"
  | "cgv"
  | "cgu"
  | "politique-cookies";
