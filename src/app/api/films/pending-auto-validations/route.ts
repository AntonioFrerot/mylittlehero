import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import {
  getAutoValidationDueAt,
  getAutoValidationStartedAt,
  isAutoValidationDue,
  listStoryWorkspacesAwaitingAutoValidation,
} from "@/lib/story-generation/story-auto-validation";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const workspaces = await listStoryWorkspacesAwaitingAutoValidation(
    session.email
  );

  const validations = workspaces
    .map((workspace) => {
      const timerStartedAt = getAutoValidationStartedAt(workspace.manifest);
      if (!timerStartedAt) return null;

      const dueAtMs = getAutoValidationDueAt(workspace.manifest);
      if (dueAtMs == null) return null;

      return {
        filmId: workspace.filmId,
        timerStartedAt,
        dueAt: new Date(dueAtMs).toISOString(),
        isDue: isAutoValidationDue(workspace.manifest),
      };
    })
    .filter(
      (validation): validation is NonNullable<typeof validation> =>
        validation != null
    );

  return NextResponse.json({ validations });
}
