"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  hasFreeTrialIntentFromSearchParam,
  markFreeTrialIntent,
  readFreeTrialIntent,
} from "@/lib/film-creation/free-trial-intent";

export function useFreeTrialIntent(): boolean {
  const searchParams = useSearchParams();
  const essaiFromUrl = hasFreeTrialIntentFromSearchParam(searchParams);
  const [storedIntent, setStoredIntent] = useState(false);

  useEffect(() => {
    if (essaiFromUrl) {
      markFreeTrialIntent();
    }
    setStoredIntent(readFreeTrialIntent());
  }, [essaiFromUrl]);

  return essaiFromUrl || storedIntent;
}
