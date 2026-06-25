import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import {
  getValidationReminderDueAt,
  getValidationReminderStartedAt,
  isValidationReminderDue,
  trySendValidationReminderForFilm,
} from "@/lib/notifications/story-validation-reminder";
import { listStoryWorkspacesWithActiveValidationReminder } from "@/lib/story-generation/story-db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const workspaces = await listStoryWorkspacesWithActiveValidationReminder(
    session.email
  );

  const reminders = workspaces
    .map((workspace) => {
      const timerStartedAt = getValidationReminderStartedAt(workspace.manifest);
      if (!timerStartedAt) return null;

      const dueAtMs = getValidationReminderDueAt(workspace.manifest);
      if (dueAtMs == null) return null;

      return {
        filmId: workspace.filmId,
        timerStartedAt,
        dueAt: new Date(dueAtMs).toISOString(),
        isDue: isValidationReminderDue(workspace.manifest),
      };
    })
    .filter((reminder): reminder is NonNullable<typeof reminder> => reminder != null);

  return NextResponse.json({ reminders });
}
