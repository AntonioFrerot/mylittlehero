"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { AdminClientSummary } from "@/lib/admin/clients";
import type { AdminDashboardSummary } from "@/lib/admin/summary";
import type { AdminFilmsByStatus } from "@/lib/film-creation/admin-films";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { AdminSupportChatClient } from "@/lib/support-chat/store";
import { useLocale } from "@/components/LocaleProvider";
import { AdminOverviewCards } from "@/components/admin/AdminOverviewCards";
import { AdminSubNav } from "@/components/admin/AdminSubNav";
import {
  buildAdminHash,
  parseAdminHash,
  type AdminManageTabId,
  type AdminSectionId,
} from "@/components/admin/admin-shell-types";

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

const AdminCreditsPanel = dynamic(
  () =>
    import("@/components/admin/AdminCreditsPanel").then((module) => ({
      default: module.AdminCreditsPanel,
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

const AdminSubscriptionSimulatorForm = dynamic(
  () =>
    import("@/components/admin/AdminSubscriptionSimulatorForm").then((module) => ({
      default: module.AdminSubscriptionSimulatorForm,
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

type AdminShellProps = {
  defaultEmail: string;
  locale: LocaleCode;
  adminSubscriptionPlanId?: string | null;
};

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
      className={`admin-nav-btn${active ? " admin-nav-btn--active" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="admin-nav-btn__label">{label}</span>
        {typeof badge === "number" && badge > 0 ? (
          <span className="admin-nav-btn__badge">{badge}</span>
        ) : null}
      </div>
      <p className="admin-nav-btn__hint">{description}</p>
    </button>
  );
}

function CategoryHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="admin-category-header">
      <h2 className="admin-category-header__title">{title}</h2>
      <p className="admin-category-header__lead">{lead}</p>
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
  return <div className="admin-category-panel">{children}</div>;
}

export function AdminShell({
  defaultEmail,
  locale,
  adminSubscriptionPlanId = null,
}: AdminShellProps) {
  const { t } = useLocale();
  const [activeSection, setActiveSection] = useState<AdminSectionId>("films");
  const [activeManageTab, setActiveManageTab] =
    useState<AdminManageTabId>("credits");
  const [grantEmail, setGrantEmail] = useState(defaultEmail);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [sectionData, setSectionData] = useState<SectionData>({});
  const [loadedSections, setLoadedSections] = useState<
    Partial<Record<AdminSectionId, boolean>>
  >({});
  const [loadedManageTabs, setLoadedManageTabs] = useState<
    Partial<Record<AdminManageTabId, boolean>>
  >({});
  const [loadingSection, setLoadingSection] = useState<AdminSectionId | null>(
    null
  );
  const [loadingManageTab, setLoadingManageTab] =
    useState<AdminManageTabId | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const loadingRef = useRef<Partial<Record<AdminSectionId, boolean>>>({});
  const loadingManageRef = useRef<Partial<Record<AdminManageTabId, boolean>>>(
    {}
  );

  const syncFromHash = useCallback(() => {
    const parsed = parseAdminHash(window.location.hash);
    setActiveSection(parsed.section);
    setActiveManageTab(parsed.manageTab);
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

  const loadSection = useCallback(
    async (section: AdminSectionId) => {
      if (
        section === "stats" ||
        section === "manage" ||
        loadedSections[section] ||
        loadingRef.current[section]
      ) {
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
          const response = await fetch("/api/admin/clients");
          if (!response.ok) throw new Error("fetch_failed");
          const clients = (await response.json()) as AdminClientSummary[];
          setSectionData((current) => ({ ...current, clients }));
        }

        setLoadedSections((current) => ({ ...current, [section]: true }));
      } catch {
        setSectionError(t("admin.sectionLoadError"));
      } finally {
        loadingRef.current[section] = false;
        setLoadingSection(null);
      }
    },
    [loadedSections, t]
  );

  const loadManageTab = useCallback(
    async (tab: AdminManageTabId) => {
      if (tab !== "support" || loadedManageTabs.support || loadingManageRef.current.support) {
        return;
      }

      loadingManageRef.current.support = true;
      setLoadingManageTab("support");
      setSectionError(null);

      try {
        const response = await fetch("/api/admin/support-chat");
        if (!response.ok) throw new Error("fetch_failed");
        const supportChat =
          (await response.json()) as AdminSupportChatClient[];
        setSectionData((current) => ({ ...current, supportChat }));
        setLoadedManageTabs((current) => ({ ...current, support: true }));
      } catch {
        setSectionError(t("admin.sectionLoadError"));
      } finally {
        loadingManageRef.current.support = false;
        setLoadingManageTab(null);
      }
    },
    [loadedManageTabs.support, t]
  );

  useEffect(() => {
    void loadSection(activeSection);
  }, [activeSection, loadSection]);

  useEffect(() => {
    if (activeSection === "manage") {
      void loadManageTab(activeManageTab);
    }
  }, [activeSection, activeManageTab, loadManageTab]);

  const navigate = (section: AdminSectionId, manageTab?: AdminManageTabId) => {
    const tab = section === "manage" ? (manageTab ?? activeManageTab) : "credits";
    setActiveSection(section);
    if (section === "manage") {
      setActiveManageTab(tab);
    }
    window.history.replaceState(null, "", buildAdminHash(section, tab));
  };

  const selectClientForCredits = (email: string) => {
    setGrantEmail(email);
    navigate("manage", "credits");
  };

  const productionNav = [
    {
      id: "films" as const,
      label: t("admin.navFilms"),
      description: t("admin.navFilmsHint"),
      badge: summary?.awaitingFilmsCount,
    },
    {
      id: "stats" as const,
      label: t("admin.navStats"),
      description: t("admin.navStatsHint"),
    },
  ];

  const accountNav = [
    {
      id: "clients" as const,
      label: t("admin.navClients"),
      description: t("admin.navClientsHint"),
      badge: summary?.clientCount,
    },
    {
      id: "manage" as const,
      label: t("admin.navManage"),
      description: t("admin.navManageHint"),
    },
  ];

  const manageTabs: { id: AdminManageTabId; label: string; badge?: number }[] = [
    { id: "credits", label: t("admin.manageTabCredits") },
    { id: "notifications", label: t("admin.manageTabNotifications") },
    {
      id: "support",
      label: t("admin.manageTabSupport"),
      badge: sectionData.supportChat?.length,
    },
    { id: "tools", label: t("admin.manageTabTools") },
  ];

  const films = sectionData.films;
  const clients = sectionData.clients;
  const supportChatClients = sectionData.supportChat;

  return (
    <div className="admin-shell mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-10">
      <AdminOverviewCards summary={summary} />

      <div className="admin-shell__layout">
        <aside className="admin-shell__sidebar">
          <div className="admin-nav-group">
            <p className="admin-nav-group__eyebrow">{t("admin.navGroupProduction")}</p>
            <nav className="admin-nav-group__items">
              {productionNav.map((item) => (
                <NavButton
                  key={item.id}
                  active={activeSection === item.id}
                  label={item.label}
                  description={item.description}
                  badge={item.badge}
                  onClick={() => navigate(item.id)}
                />
              ))}
            </nav>
          </div>

          <div className="admin-nav-group">
            <p className="admin-nav-group__eyebrow">{t("admin.navGroupAccounts")}</p>
            <nav className="admin-nav-group__items">
              {accountNav.map((item) => (
                <NavButton
                  key={item.id}
                  active={
                    item.id === "manage"
                      ? activeSection === "manage"
                      : activeSection === item.id
                  }
                  label={item.label}
                  description={item.description}
                  badge={item.badge}
                  onClick={() =>
                    navigate(item.id, item.id === "manage" ? activeManageTab : undefined)
                  }
                />
              ))}
            </nav>
          </div>
        </aside>

        <div className="admin-shell__content">
          {sectionError ? (
            <p className="admin-shell__error" role="alert">
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
                awaitingUrgent={films.awaitingUrgent}
                awaitingScheduled={films.awaitingScheduled}
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
              <AdminClientsList
                clients={clients}
                locale={locale}
                onSelectEmail={selectClientForCredits}
              />
            ) : null}
          </CategoryPanel>

          <CategoryPanel id="manage" active={activeSection}>
            <CategoryHeader
              title={t("admin.categoryManageTitle")}
              lead={t("admin.categoryManageLead")}
            />
            <AdminSubNav
              items={manageTabs}
              active={activeManageTab}
              onSelect={(tab) => navigate("manage", tab)}
              ariaLabel={t("admin.manageSubNavLabel")}
            />

            <div className="admin-manage-panel">
              {activeManageTab === "credits" ? (
                <AdminCreditsPanel grantEmail={grantEmail} />
              ) : null}

              {activeManageTab === "notifications" ? (
                <AdminNotificationsForm />
              ) : null}

              {activeManageTab === "support" ? (
                loadingManageTab === "support" && !supportChatClients ? (
                  <AdminSectionSkeleton />
                ) : supportChatClients ? (
                  <AdminSupportChatList
                    clients={supportChatClients}
                    locale={locale}
                  />
                ) : null
              ) : null}

              {activeManageTab === "tools" ? (
                <AdminSubscriptionSimulatorForm
                  adminEmail={defaultEmail}
                  currentPlanId={adminSubscriptionPlanId}
                />
              ) : null}
            </div>
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
