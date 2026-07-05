import type {
  SubscriptionGrantPeriod,
  SubscriptionTier,
} from "./subscription-tier";

export type SubscriptionGrantScheduleContext = {
  active: boolean;
  tier: SubscriptionTier | null;
  period: SubscriptionGrantPeriod | null;
  anchorDayKey: string | null;
  minScheduleDayKey: string | null;
  /** Programmations sans ticket encore possibles cette année d'abonnement. */
  remainingScheduleSlots: number;
  annualGrantCap: number;
  elapsedGrantsInYear: number;
  scheduledGrantCount: number;
  canScheduleMore: boolean;
};
