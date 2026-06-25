import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { STORY_VALIDATION_REMINDER_DELAY_MS } from "@/lib/notifications/story-validation-reminder";
import { listStoryWorkspacesAwaitingClientValidation } from "@/lib/story-generation/story-db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const workspaces = await listStoryWorkspacesAwaitingClientValidation(
    session.email
  );

  const reminders = workspaces
    .map((workspace) => {
      const generationCompletedAt =
        workspace.manifest.generationCompletedAt?.trim();
      if (!generationCompletedAt) return null;

      const completedAt = new Date(generationCompletedAt).getTime();
      if (Number.isNaN(completedAt)) return null;

      const dueAt = new Date(
        completedAt + STORY_VALIDATION_REMINDER_DELAY_MS
      ).toISOString();

      return {
        filmId: workspace.filmId,
        generationCompletedAt,
        dueAt,
        isDue: Date.now() >= completedAt + STORY_VALIDATION_REMINDER_DELAY_MS,
      };
    })
    .filter((reminder): reminder is NonNullable<typeof reminder> => reminder != null);

  return NextResponse.json({ reminders });
}
