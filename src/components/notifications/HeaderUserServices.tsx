"use client";

import dynamic from "next/dynamic";
import { useAuthUser } from "@/hooks/use-auth-user";

const StoryValidationReminderPoll = dynamic(
  () =>
    import("@/components/notifications/StoryValidationReminderPoll").then(
      (module) => module.StoryValidationReminderPoll
    ),
  { ssr: false }
);

const HeaderNotificationBell = dynamic(
  () =>
    import("@/components/notifications/HeaderNotificationBell").then(
      (module) => module.HeaderNotificationBell
    ),
  { ssr: false }
);

export function StoryValidationReminderPollLazy() {
  const user = useAuthUser();
  if (!user) return null;
  return <StoryValidationReminderPoll />;
}

export function HeaderNotificationBellLazy({
  className = "",
}: {
  className?: string;
}) {
  const user = useAuthUser();
  if (!user) return null;
  return <HeaderNotificationBell className={className} />;
}
