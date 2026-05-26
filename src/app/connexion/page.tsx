import { Header } from "@/components/Header";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession } from "@/lib/auth/get-session";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("auth.loginTitle")} — ${BRAND_NAME}`,
    description: t("meta.connexionDescription"),
  };
}

type PageProps = {
  searchParams: Promise<{ redirect?: string; mode?: string }>;
};

function safeRedirect(path: string | undefined): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/creer-film";
}

export default async function ConnexionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect);
  const initialMode = params.mode === "signup" ? "signup" : "login";

  const session = await getSession();
  if (session) {
    redirect(redirectTo);
  }

  const { t } = await getServerTranslator();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20 safe-top-offset">
        <div className="mx-auto max-w-md px-4 md:px-8">
          <Link
            href="/"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("space.backHome")}
          </Link>

          <h1 className="font-display mt-8 text-center text-3xl font-bold text-cream md:text-4xl">
            {initialMode === "signup" ? t("auth.signupTitle") : t("auth.loginTitle")}
          </h1>
          <p className="mt-3 text-center text-cream/65">{t("auth.loginSubtitle")}</p>

          <div className="mt-10">
            <AuthForm redirectTo={redirectTo} initialMode={initialMode} />
          </div>
        </div>
      </main>
    </>
  );
}
