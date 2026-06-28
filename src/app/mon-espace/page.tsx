import { Header } from "@/components/Header";
import { MonEspaceShell } from "@/components/espace/MonEspaceShell";
import { DEFAULT_ESPACE_SECTION, parseEspaceSection } from "@/lib/espace/sections";
import { getSession } from "@/lib/auth/get-session";
import { loadMonEspacePageData } from "@/lib/espace/load-page";
import { getServerTranslator } from "@/lib/i18n/server";
import { BRAND_NAME } from "@/lib/brand";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.monEspaceTitle")} — ${BRAND_NAME}`,
    description: t("meta.monEspaceDescription"),
  };
}

type PageProps = {
  searchParams: Promise<{ section?: string }>;
};

export default async function MonEspacePage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect(
      `/connexion?redirect=${encodeURIComponent("/mon-espace?section=films")}`
    );
  }

  const params = await searchParams;
  const section = parseEspaceSection(params.section ?? DEFAULT_ESPACE_SECTION);
  const [{ t }, pageData] = await Promise.all([
    getServerTranslator(),
    loadMonEspacePageData(session.email),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20">
        <section className="mon-espace-hero safe-top-offset" aria-labelledby="mon-espace-title">
          <div className="mon-espace-hero__ambient" aria-hidden>
            <div className="mon-espace-hero__glow mon-espace-hero__glow--gold" />
            <div className="mon-espace-hero__glow mon-espace-hero__glow--violet" />
          </div>

          <div className="mon-espace-hero__shell mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
            <div className="mon-espace-hero__top">
              <Link href="/" className="mon-espace-hero__back">
                {t("space.backHome")}
              </Link>
            </div>

            <header className="mon-espace-hero__header">
              <h1 id="mon-espace-title" className="mon-espace-hero__title">
                <span className="mon-espace-hero__title-before">
                  {t("space.heroTitleBefore")}
                </span>
                <span className="mon-espace-hero__title-accent">
                  {t("space.heroTitleAccent")}
                </span>
              </h1>
              <p className="mon-espace-hero__lead">{t("space.heroLead")}</p>
            </header>
          </div>
        </section>

        <MonEspaceShell initialSection={section} data={pageData} />
      </main>
    </>
  );
}
