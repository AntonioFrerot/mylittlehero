"use client";

import dynamic from "next/dynamic";
import { useAuthUser } from "@/hooks/use-auth-user";

const StoryAutoValidationPoll = dynamic(
  () =>
    import("@/components/notifications/StoryAutoValidationPoll").then(
      (module) => module.StoryAutoValidationPoll
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

export function StoryAutoValidationPollLazy() {
  const user = useAuthUser();
  if (!user) return null;
  return <StoryAutoValidationPoll />;
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
