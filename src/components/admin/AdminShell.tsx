"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { AdminClientSummary } from "@/lib/admin/clients";
import type { AdminDashboardSummary } from "@/lib/admin/summary";
import type { AdminFilmsByStatus } from "@/lib/film-creation/admin-films";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { AdminSupportChatClient } from "@/lib/support-chat/store";
import { useLocale } from "@/components/LocaleProvider";

const AdminFilmsList = dynamic(
  () =>
    import("@/components/admin/AdminFilmsList").then((module) => ({
      default: module.AdminFilmsList,
    })),
  { loading: () => <AdminSectionSkeleton /> }
);

const AdminClientsList = dynamic(
  () =>
    import("@/components/admin/AdminClientsList").then((module) => ({
      default: module.AdminClientsList,
    })),
  { loading: () => <AdminSectionSkeleton /> }
);

const AdminGrantTicketsForm = dynamic(
  () =>
    import("@/components/admin/AdminGrantTicketsForm").then((module) => ({
      default: module.AdminGrantTicketsForm,
    })),
  { loading: () => <AdminSectionSkeleton /> }
);

const AdminNotificationsForm = dynamic(
  () =>
    import("@/components/admin/AdminNotificationsForm").then((module) => ({
      default: module.AdminNotificationsForm,
    })),
  { loading: () => <AdminSectionSkeleton /> }
);

const AdminSupportChatList = dynamic(
  () =>
    import("@/components/admin/AdminSupportChatList").then((module) => ({
      default: module.AdminSupportChatList,
    })),
  { loading: () => <AdminSectionSkeleton /> }
);

const AdminAnalyticsDashboard = dynamic(
  () =>
    import("@/components/admin/AdminAnalyticsDashboard").then((module) => ({
      default: module.AdminAnalyticsDashboard,
    })),
  { loading: () => <AdminSectionSkeleton /> }
);

export type AdminSectionId = "films" | "clients" | "stats";

type AdminShellProps = {
  defaultEmail: string;
  locale: LocaleCode;
};

const SECTION_IDS: AdminSectionId[] = ["films", "clients", "stats"];

type SectionData = {
  films?: AdminFilmsByStatus;
  clients?: AdminClientSummary[];
  supportChat?: AdminSupportChatClient[];
};

function AdminSectionSkeleton() {
  const { t } = useLocale();
  return (
    <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
      {t("admin.sectionLoading")}
    </p>
  );
}

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

export function AdminShell({ defaultEmail, locale }: AdminShellProps) {
  const { t } = useLocale();
  const [activeSection, setActiveSection] = useState<AdminSectionId>("films");
  const [grantEmail, setGrantEmail] = useState(defaultEmail);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [sectionData, setSectionData] = useState<SectionData>({});
  const [loadedSections, setLoadedSections] = useState<
    Partial<Record<AdminSectionId, boolean>>
  >({});
  const [loadingSection, setLoadingSection] = useState<AdminSectionId | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const loadingRef = useRef<Partial<Record<AdminSectionId, boolean>>>({});

  const syncFromHash = useCallback(() => {
    const section = parseSectionHash(window.location.hash);
    if (section) setActiveSection(section);
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  useEffect(() => {
    void fetch("/api/admin/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: AdminDashboardSummary | null) => {
        if (data) setSummary(data);
      })
      .catch(() => {});
  }, []);

  const loadSection = useCallback(async (section: AdminSectionId) => {
    if (section === "stats" || loadedSections[section] || loadingRef.current[section]) {
      return;
    }

    loadingRef.current[section] = true;
    setLoadingSection(section);
    setSectionError(null);

    try {
      if (section === "films") {
        const response = await fetch("/api/admin/films");
        if (!response.ok) throw new Error("fetch_failed");
        const films = (await response.json()) as AdminFilmsByStatus;
        setSectionData((current) => ({ ...current, films }));
      }

      if (section === "clients") {
        const [clientsResponse, supportResponse] = await Promise.all([
          fetch("/api/admin/clients"),
          fetch("/api/admin/support-chat"),
        ]);
        if (!clientsResponse.ok || !supportResponse.ok) {
          throw new Error("fetch_failed");
        }
        const clients = (await clientsResponse.json()) as AdminClientSummary[];
        const supportChat =
          (await supportResponse.json()) as AdminSupportChatClient[];
        setSectionData((current) => ({ ...current, clients, supportChat }));
      }

      setLoadedSections((current) => ({ ...current, [section]: true }));
    } catch {
      setSectionError(t("admin.sectionLoadError"));
    } finally {
      loadingRef.current[section] = false;
      setLoadingSection(null);
    }
  }, [loadedSections, t]);

  useEffect(() => {
    void loadSection(activeSection);
  }, [activeSection, loadSection]);

  const selectSection = (section: AdminSectionId) => {
    setActiveSection(section);
    window.history.replaceState(null, "", `#${section}`);
  };

  const navItems = [
    {
      id: "films" as const,
      label: t("admin.navFilms"),
      description: t("admin.navFilmsHint"),
      badge: summary?.awaitingFilmsCount,
    },
    {
      id: "clients" as const,
      label: t("admin.navClients"),
      description: t("admin.navClientsHint"),
      badge: summary?.clientCount,
    },
    {
      id: "stats" as const,
      label: t("admin.navStats"),
      description: t("admin.navStatsHint"),
    },
  ];

  const films = sectionData.films;
  const clients = sectionData.clients;
  const supportChatClients = sectionData.supportChat;

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
          {sectionError ? (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {sectionError}
            </p>
          ) : null}

          <CategoryPanel id="films" active={activeSection}>
            <CategoryHeader
              title={t("admin.categoryFilmsTitle")}
              lead={t("admin.categoryFilmsLead")}
            />
            {loadingSection === "films" && !films ? (
              <AdminSectionSkeleton />
            ) : films ? (
              <AdminFilmsList
                awaiting={films.awaiting}
                completed={films.completed}
                locale={locale}
              />
            ) : null}
          </CategoryPanel>

          <CategoryPanel id="clients" active={activeSection}>
            <CategoryHeader
              title={t("admin.categoryClientsTitle")}
              lead={t("admin.categoryClientsLead")}
            />
            {loadingSection === "clients" && !clients ? (
              <AdminSectionSkeleton />
            ) : clients ? (
              <div className="space-y-8">
                <AdminClientsList
                  clients={clients}
                  locale={locale}
                  onSelectEmail={setGrantEmail}
                />
                <AdminGrantTicketsForm key={grantEmail} defaultEmail={grantEmail} />
                <AdminNotificationsForm />
                {supportChatClients ? (
                  <AdminSupportChatList
                    clients={supportChatClients}
                    locale={locale}
                  />
                ) : null}
              </div>
            ) : null}
          </CategoryPanel>

          <CategoryPanel id="stats" active={activeSection}>
            <CategoryHeader
              title={t("admin.categoryStatsTitle")}
              lead={t("admin.categoryStatsLead")}
            />
            <AdminAnalyticsDashboard />
          </CategoryPanel>
        </div>
      </div>
    </div>
  );
}
