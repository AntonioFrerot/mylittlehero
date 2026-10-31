import "server-only";

import { listRegisteredUsers } from "@/lib/admin/clients";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { countContactMessages } from "@/lib/contact/store";
import { countAdminFilmsAwaiting } from "@/lib/film-creation/admin-films";

export type AdminDashboardSummary = {
  awaitingFilmsCount: number;
  clientCount: number;
  contactMessageCount: number;
};

async function countAdminClients(): Promise<number> {
  const users = await listRegisteredUsers();
  return users.filter((user) => !isAdminEmail(normalizeEmail(user.email))).length;
}

export async function loadAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [awaitingFilmsCount, clientCount, contactMessageCount] = await Promise.all([
    countAdminFilmsAwaiting(),
    countAdminClients(),
    countContactMessages(),
  ]);

  return {
    awaitingFilmsCount,
    clientCount,
    contactMessageCount,
  };
}
