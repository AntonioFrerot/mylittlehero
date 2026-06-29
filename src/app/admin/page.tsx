import { Header } from "@/components/Header";
import { AdminShell } from "@/components/admin/AdminShell";
import { loadAdminAnalyticsStats } from "@/lib/analytics/load-admin-stats";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdminFilmsByStatus } from "@/lib/film-creation/admin-films";
import {
  groupConversationsByClient,
  listSupportChatConversationsForAdmin,
} from "@/lib/support-chat/store";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("admin.pageTitle")} — ${BRAND_NAME}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage() {
  const session = await requireAdmin();
  const { t, locale } = await getServerTranslator();
  const { awaiting, completed } = await listAdminFilmsByStatus();
  const supportChatClients = groupConversationsByClient(
    await listSupportChatConversationsForAdmin()
  );
  const analyticsStats = await loadAdminAnalyticsStats(locale, "week");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20">
        <section className="safe-top-offset border-b border-white/5 bg-cinema-night/60">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light/80">
              {t("admin.eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-cream md:text-4xl">
              {t("admin.pageTitle")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-cream/60 md:text-base">
              {t("admin.pageLead")}
            </p>
          </div>
        </section>

        <AdminShell
          defaultEmail={session.email}
          locale={locale}
          awaiting={awaiting}
          completed={completed}
          supportChatClients={supportChatClients}
          analyticsStats={analyticsStats}
        />
      </main>
    </>
  );
}
