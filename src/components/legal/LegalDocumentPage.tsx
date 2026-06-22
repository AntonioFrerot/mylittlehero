import Link from "next/link";
import { Header } from "@/components/Header";
import { BRAND_NAME } from "@/lib/brand";
import { LEGAL_DOCUMENT_LABEL_KEYS } from "@/lib/legal/labels";
import {
  getLegalPublisher,
  isLegalPublisherComplete,
} from "@/lib/legal/publisher";
import { LEGAL_ROUTES } from "@/lib/legal/routes";
import type { LegalDocument, LegalDocumentSlug, LegalListBlock } from "@/lib/legal/types";
import { getServerTranslator } from "@/lib/i18n/server";

type LegalDocumentPageProps = {
  document: LegalDocument;
};

function renderBlock(block: string | LegalListBlock, index: number) {
  if (typeof block === "string") {
    return (
      <p key={index} className="text-cream/75 leading-relaxed">
        {block}
      </p>
    );
  }

  const ListTag = block.type === "ol" ? "ol" : "ul";
  return (
    <ListTag
      key={index}
      className={`ml-5 space-y-2 text-cream/75 leading-relaxed ${block.type === "ol" ? "list-decimal" : "list-disc"}`}
    >
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ListTag>
  );
}

export async function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  const { t, locale } = await getServerTranslator();
  const publisher = getLegalPublisher();
  const publisherIncomplete = !isLegalPublisherComplete(publisher);

  const relatedLinks = (Object.keys(LEGAL_ROUTES) as LegalDocumentSlug[])
    .filter((slug) => slug !== document.slug)
    .map((slug) => ({
      slug,
      href: LEGAL_ROUTES[slug],
      label: t(LEGAL_DOCUMENT_LABEL_KEYS[slug]),
    }));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20 safe-top-offset">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <Link
            href="/"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("legal.backHome")}
          </Link>

          {publisherIncomplete && locale === "fr" ? (
            <p
              className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90"
              role="status"
            >
              {t("legal.publisherIncomplete")}
            </p>
          ) : null}

          <header className="mt-8 border-b border-white/10 pb-8">
            <p className="text-sm font-medium uppercase tracking-wider text-gold/80">
              {BRAND_NAME}
            </p>
            <h1 className="font-display mt-2 text-3xl font-bold text-cream md:text-4xl">
              {document.title}
            </h1>
            <p className="mt-3 text-sm text-cream/50">
              {t("legal.lastUpdated", { date: document.lastUpdated })}
            </p>
          </header>

          <article className="mt-10 space-y-10">
            {document.sections.map((section) => (
              <section
                key={section.id ?? section.title}
                id={section.id}
                className="scroll-mt-28 space-y-4"
              >
                <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.body.map((block, index) => renderBlock(block, index))}
                </div>
              </section>
            ))}
          </article>

          <aside className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-cream">
              {t("legal.relatedTitle")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {relatedLinks.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={link.href}
                    className="text-gold-light transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
