"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminClientsList } from "@/components/admin/AdminClientsList";
import { AdminFilmsList } from "@/components/admin/AdminFilmsList";
import { AdminGrantTicketsForm } from "@/components/admin/AdminGrantTicketsForm";
import { AdminNotificationsForm } from "@/components/admin/AdminNotificationsForm";
import { AdminSupportChatList } from "@/components/admin/AdminSupportChatList";
import type { AdminClientEntry } from "@/lib/admin/clients";
import type { AdminAnalyticsStats } from "@/lib/analytics/types";
import type { AdminFilmEntry } from "@/lib/film-creation/admin-films";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { AdminSupportChatClient } from "@/lib/support-chat/store";
import { useLocale } from "@/components/LocaleProvider";

export type AdminSectionId = "films" | "clients" | "stats";

type AdminShellProps = {
  defaultEmail: string;
  locale: LocaleCode;
  awaiting: AdminFilmEntry[];
  completed: AdminFilmEntry[];
  adminClients: AdminClientEntry[];
  supportChatClients: AdminSupportChatClient[];
  analyticsStats: AdminAnalyticsStats;
};

const SECTION_IDS: AdminSectionId[] = ["films", "clients", "stats"];

function parseSectionHash(hash: string): AdminSectionId | null {
  const value = hash.replace(/^#/, "");
  return SECTION_IDS.includes(value as AdminSectionId)
    ? (value as AdminSectionId)
    : null;
}

function NavButton({
  active,
  label,
  description,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
        active
          ? "border-gold/40 bg-gold/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-white/8 bg-cinema-night/40 hover:border-white/15 hover:bg-cinema-night/70"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-display text-sm font-semibold md:text-base ${
            active ? "text-gold-light" : "text-cream"
          }`}
        >
          {label}
        </span>
        {typeof badge === "number" && badge > 0 ? (
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-gold-light">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-cream/50">{description}</p>
    </button>
  );
}

function CategoryHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="border-b border-white/8 pb-5">
      <h2 className="font-display text-2xl font-semibold text-cream md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-cream/60 md:text-base">{lead}</p>
    </header>
  );
}

function CategoryPanel({
  id,
  active,
  children,
}: {
  id: AdminSectionId;
  active: AdminSectionId;
  children: ReactNode;
}) {
  if (active !== id) return null;
  return <div className="space-y-8">{children}</div>;
}

export function AdminShell({
  defaultEmail,
  locale,
  awaiting,
  completed,
  adminClients,
  supportChatClients,
  analyticsStats,
}: AdminShellProps) {
  const { t } = useLocale();
  const [activeSection, setActiveSection] = useState<AdminSectionId>("films");
  const [grantEmail, setGrantEmail] = useState(defaultEmail);

  const syncFromHash = useCallback(() => {
    const section = parseSectionHash(window.location.hash);
    if (section) setActiveSection(section);
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  const selectSection = (section: AdminSectionId) => {
    setActiveSection(section);
    window.history.replaceState(null, "", `#${section}`);
  };

  const navItems = [
    {
      id: "films" as const,
      label: t("admin.navFilms"),
      description: t("admin.navFilmsHint"),
      badge: awaiting.length,
    },
    {
      id: "clients" as const,
      label: t("admin.navClients"),
      description: t("admin.navClientsHint"),
      badge: adminClients.length,
    },
    {
      id: "stats" as const,
      label: t("admin.navStats"),
      description: t("admin.navStatsHint"),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 md:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <aside className="lg:w-60 lg:shrink-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream/40">
            {t("admin.navEyebrow")}
          </p>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                active={activeSection === item.id}
                label={item.label}
                description={item.description}
                badge={item.badge}
                onClick={() => selectSection(item.id)}
              />
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <CategoryPanel id="films" active={activeSection}>
            <CategoryHeader
              title={t("admin.categoryFilmsTitle")}
              lead={t("admin.categoryFilmsLead")}
            />
            <AdminFilmsList
              awaiting={awaiting}
              completed={completed}
              locale={locale}
            />
          </CategoryPanel>

          <CategoryPanel id="clients" active={activeSection}>
            <CategoryHeader
              title={t("admin.categoryClientsTitle")}
              lead={t("admin.categoryClientsLead")}
            />
            <div className="space-y-8">
              <AdminClientsList
                clients={adminClients}
                locale={locale}
                onSelectEmail={setGrantEmail}
              />
              <AdminGrantTicketsForm key={grantEmail} defaultEmail={grantEmail} />
              <AdminNotificationsForm />
              <AdminSupportChatList clients={supportChatClients} locale={locale} />
            </div>
          </CategoryPanel>

          <CategoryPanel id="stats" active={activeSection}>
            <CategoryHeader
              title={t("admin.categoryStatsTitle")}
              lead={t("admin.categoryStatsLead")}
            />
            <AdminAnalyticsDashboard initialStats={analyticsStats} />
          </CategoryPanel>
        </div>
      </div>
    </div>
  );
}
