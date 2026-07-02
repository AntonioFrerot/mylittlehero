import { getUserLocale } from "@/lib/auth/users-store";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import { createNotification } from "./store";

export async function notifyTicketBalanceUpdated(input: {
  userEmail: string;
  balance: number;
  ticketsGranted: number;
  referenceId: string;
}): Promise<void> {
  const locale = (await getUserLocale(input.userEmail)) as LocaleCode;
  const t = createTranslator(locale);

  await createNotification({
    userEmail: input.userEmail,
    kind: "ticket_balance_updated",
    title: t("notifications.ticketBalanceUpdatedTitle", {
      count: input.ticketsGranted,
    }),
    body: String(input.balance),
    href: "/mon-espace",
    referenceId: input.referenceId,
  });
}
