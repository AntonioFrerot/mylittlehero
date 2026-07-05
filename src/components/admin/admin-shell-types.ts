export type AdminSectionId = "films" | "clients" | "manage" | "stats";

export type AdminManageTabId = "credits" | "notifications" | "support" | "tools";

export const ADMIN_SECTION_IDS: AdminSectionId[] = [
  "films",
  "clients",
  "manage",
  "stats",
];

export const ADMIN_MANAGE_TAB_IDS: AdminManageTabId[] = [
  "credits",
  "notifications",
  "support",
  "tools",
];

export function parseAdminHash(hash: string): {
  section: AdminSectionId;
  manageTab: AdminManageTabId;
} {
  const value = hash.replace(/^#/, "").trim();

  if (value.startsWith("manage-")) {
    const tab = value.slice("manage-".length) as AdminManageTabId;
    return {
      section: "manage",
      manageTab: ADMIN_MANAGE_TAB_IDS.includes(tab) ? tab : "credits",
    };
  }

  if (ADMIN_SECTION_IDS.includes(value as AdminSectionId)) {
    return {
      section: value as AdminSectionId,
      manageTab: "credits",
    };
  }

  return { section: "films", manageTab: "credits" };
}

export function buildAdminHash(
  section: AdminSectionId,
  manageTab: AdminManageTabId = "credits"
): string {
  if (section === "manage") {
    return `#manage-${manageTab}`;
  }
  return `#${section}`;
}
