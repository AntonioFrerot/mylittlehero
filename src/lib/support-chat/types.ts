export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SupportUserFilmSummary = {
  title: string;
  status: string;
};

export type SupportUserContext = {
  email: string;
  name?: string;
  ticketBalance: number;
  hasActiveSubscription: boolean;
  subscriptionPlanName?: string;
  freeFilmAvailable: boolean;
  characterCount: number;
  charactersWithPhoto: number;
  filmCount: number;
  recentFilms: SupportUserFilmSummary[];
  creationCooldownActive: boolean;
  creationCooldownRemaining: string | null;
};

export type GenerateSupportReplyOptions = {
  locale?: import("@/lib/i18n/locales").LocaleCode;
  userContext?: SupportUserContext | null;
};
