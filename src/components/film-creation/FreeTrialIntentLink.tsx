"use client";

import { Button } from "@/components/ui/Button";
import { markFreeTrialIntent } from "@/lib/film-creation/free-trial-intent";

type FreeTrialIntentLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function FreeTrialIntentLink({
  href,
  className = "",
  children,
}: FreeTrialIntentLinkProps) {
  return (
    <Button
      href={href}
      variant="primary"
      className={className}
      onClick={() => markFreeTrialIntent()}
    >
      {children}
    </Button>
  );
}
