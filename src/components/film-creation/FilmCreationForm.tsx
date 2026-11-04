"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useTicketBalance } from "@/hooks/use-ticket-balance";
import {
  getTicketsRequiredForDuration,
  PAID_FILM_DURATION_MIN_SECONDS,
  isSampleFilmDuration,
  JETONS_REQUIRED_FOR_SAMPLE,
} from "@/lib/purchases/ticket-rules";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import {
  saveFilmCreation,
  type FilmCreationFormState,
} from "@/lib/film-creation/actions";
import {
  clearFilmCreationDraft,
  filmCreationDraftStorageKey,
  readFilmCreationDraft,
  writeFilmCreationDraft,
  type FilmCreationFormDraftPayload,
  type YesNoChoice,
} from "@/lib/film-creation/form-draft";
import { CharacterFacePicker } from "@/components/film-creation/CharacterFacePicker";
import { FilmCreationCooldown } from "@/components/film-creation/FilmCreationCooldown";
import { ScheduleFilmModal } from "@/components/film-creation/ScheduleFilmModal";
import { FilmThemePicker } from "@/components/film-creation/FilmThemePicker";
import { FilmDurationPicker } from "@/components/film-creation/FilmDurationPicker";
import { YesNoTextField } from "@/components/film-creation/YesNoTextField";
import { TicketCountPill } from "@/components/tickets/TicketCountPill";
import { JetonCountPill } from "@/components/tickets/JetonCountPill";
import {
  BTN_3D_PRIMARY_ACTION,
  BTN_FILM_CREATE_SUBMIT,
} from "@/lib/ui/button-3d-classes";
import type { Character } from "@/lib/characters/types";
import type { SubscriptionGrantScheduleContext } from "@/lib/purchases/subscription-scheduling-types";

const initialState: FilmCreationFormState = {};

const INACTIVE_SUBSCRIPTION_GRANT: SubscriptionGrantScheduleContext = {
  active: false,
  tier: null,
  period: null,
  anchorDayKey: null,
  minScheduleDayKey: null,
  remainingScheduleSlots: 0,
  annualGrantCap: 0,
  elapsedGrantsInYear: 0,
  scheduledGrantCount: 0,
  canScheduleMore: false,
};

type FilmCreationFormProps = {
  accountEmail: string;
  characters: Character[];
  ticketBalance: number;
  jetonBalance: number;
  hasActiveSubscription: boolean;
  cooldownEndsAt?: string | null;
  registrationDate: string;
  occupiedScheduleDates?: string[];
  subscriptionGrantSchedule?: SubscriptionGrantScheduleContext;
};

export function FilmCreationForm({
  accountEmail,
  characters,
  ticketBalance,
  jetonBalance,
  hasActiveSubscription,
  cooldownEndsAt = null,
  registrationDate,
  occupiedScheduleDates = [],
  subscriptionGrantSchedule = INACTIVE_SUBSCRIPTION_GRANT,
}: FilmCreationFormProps) {
  const { t } = useLocale();
  const draftStorageKey = filmCreationDraftStorageKey(accountEmail);
  const formRef = useRef<HTMLFormElement>(null);
  const scheduledDateInputRef = useRef<HTMLInputElement>(null);
  const draftPayloadRef = useRef<FilmCreationFormDraftPayload>({
    themes: [],
    characterIds: [],
    durationSeconds: PAID_FILM_DURATION_MIN_SECONDS,
    avoidChoice: null,
    avoid: "",
    storyChoice: null,
    additionalInfo: "",
  });
  const [persistEnabled, setPersistEnabled] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(
    PAID_FILM_DURATION_MIN_SECONDS
  );
  const [avoidChoice, setAvoidChoice] = useState<YesNoChoice | null>(null);
  const [avoidText, setAvoidText] = useState("");
  const [storyChoice, setStoryChoice] = useState<YesNoChoice | null>(null);
  const [storyText, setStoryText] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(() => {
    if (!cooldownEndsAt) return false;
    return new Date(cooldownEndsAt).getTime() > Date.now();
  });
  const [state, formAction, pending] = useActionState(
    saveFilmCreation,
    initialState
  );
  const { balance: liveBalance } = useTicketBalance();
  const effectiveTicketBalance = liveBalance ?? ticketBalance;

  const isSampleFilm =
    durationSeconds != null && isSampleFilmDuration(durationSeconds);

  useEffect(() => {
    if (isSampleFilm) {
      setScheduleModalOpen(false);
    }
  }, [isSampleFilm]);

  const subscriptionGrantActive = subscriptionGrantSchedule.active;

  const eligibleCharacters = useMemo(
    () => characters.filter((c) => c.photoSrc && c.audioSrc),
    [characters]
  );
  const eligibleCharacterIdsKey = useMemo(
    () => eligibleCharacters.map((c) => c.id).join("\0"),
    [eligibleCharacters]
  );
  const missingPhoto = useMemo(
    () => characters.filter((c) => !c.photoSrc),
    [characters]
  );

  useEffect(() => {
    const draft = readFilmCreationDraft(draftStorageKey);
    if (draft) {
      setSelectedThemes(draft.themes);
      setSelectedCharacterIds(draft.characterIds);
      if (draft.durationSeconds != null && !subscriptionGrantActive) {
        setDurationSeconds(draft.durationSeconds);
      }
      setAvoidChoice(draft.avoidChoice);
      setAvoidText(draft.avoid);
      setStoryChoice(draft.storyChoice);
      setStoryText(draft.additionalInfo);
    } else if (subscriptionGrantActive) {
      setDurationSeconds(PAID_FILM_DURATION_MIN_SECONDS);
    }
    setPersistEnabled(true);
  }, [draftStorageKey, subscriptionGrantActive]);

  useEffect(() => {
    draftPayloadRef.current = {
      themes: selectedThemes,
      characterIds: selectedCharacterIds,
      durationSeconds,
      avoidChoice,
      avoid: avoidText,
      storyChoice,
      additionalInfo: storyText,
    };
  }, [
    selectedThemes,
    selectedCharacterIds,
    durationSeconds,
    avoidChoice,
    avoidText,
    storyChoice,
    storyText,
  ]);

  useEffect(() => {
    if (!persistEnabled) return;
    writeFilmCreationDraft(draftStorageKey, draftPayloadRef.current);
  }, [
    persistEnabled,
    draftStorageKey,
    selectedThemes,
    selectedCharacterIds,
    durationSeconds,
    avoidChoice,
    avoidText,
    storyChoice,
    storyText,
  ]);

  useEffect(() => {
    if (!persistEnabled) return;

    function flushDraft() {
      writeFilmCreationDraft(draftStorageKey, draftPayloadRef.current);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flushDraft();
      }
    }

    window.addEventListener("pagehide", flushDraft);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushDraft);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [persistEnabled, draftStorageKey]);

  useEffect(() => {
    const eligibleIds = new Set(eligibleCharacterIdsKey.split("\0").filter(Boolean));
    setSelectedCharacterIds((current) => {
      const next = current.filter((id) => eligibleIds.has(id));
      if (next.length === current.length && next.every((id, i) => id === current[i])) {
        return current;
      }
      return next;
    });
  }, [eligibleCharacterIdsKey]);

  const ticketsRequired =
    durationSeconds != null
      ? isSampleFilm
        ? 0
        : getTicketsRequiredForDuration(durationSeconds)
      : 0;
  const insufficientTickets =
    durationSeconds != null &&
    !isSampleFilm &&
    !hasActiveSubscription &&
    effectiveTicketBalance < ticketsRequired;
  const insufficientJetons =
    isSampleFilm && jetonBalance < JETONS_REQUIRED_FOR_SAMPLE;
  const showPaidTicketBadge =
    durationSeconds != null &&
    !isSampleFilm &&
    ticketsRequired > 0 &&
    effectiveTicketBalance > 0;
  const showCreateCostBadge =
    showPaidTicketBadge || (durationSeconds != null && isSampleFilm);

  function ticketCostLabel(count: number): string {
    return count === 1
      ? t("filmCreation.form.oneTicket")
      : t("filmCreation.form.ticketsCount", { count });
  }

  function jetonCostLabel(count: number): string {
    return count === 1
      ? t("filmCreation.form.oneJeton")
      : t("filmCreation.form.jetonsCount", { count });
  }

  function validateBeforeSubmit(
    form: HTMLFormElement,
    options?: { forSchedule?: boolean }
  ): string | null {
    const formData = new FormData(form);
    if (formData.getAll("themes").length === 0) {
      return t("filmCreation.errors.themesRequired");
    }
    if (formData.getAll("characters").length === 0) {
      return t("filmCreation.errors.selectCharacter");
    }
    const durationRaw = formData.get("duration");
    if (typeof durationRaw !== "string" || !durationRaw.trim()) {
      return t("filmCreation.errors.durationRequired");
    }
    if (!options?.forSchedule && insufficientTickets) {
      return t("filmCreation.errors.insufficientTickets");
    }
    if (insufficientJetons) {
      return t("filmCreation.errors.insufficientJetons");
    }
    if (cooldownActive) {
      return t("filmCreation.errors.cooldownActive");
    }
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const validationError = validateBeforeSubmit(event.currentTarget);
    if (validationError) {
      event.preventDefault();
      setClientError(validationError);
      return;
    }
    setClientError(null);
    clearFilmCreationDraft(draftStorageKey);
  }

  function handleScheduleFilm(dayKey: string) {
    if (!formRef.current) return;

    const validationError = validateBeforeSubmit(formRef.current, { forSchedule: true });
    if (validationError) {
      setClientError(validationError);
      setScheduleModalOpen(false);
      return;
    }

    setClientError(null);
    clearFilmCreationDraft(draftStorageKey);
    if (scheduledDateInputRef.current) {
      scheduledDateInputRef.current.value = dayKey;
    }
    formRef.current.requestSubmit();
  }

  function handleOpenScheduleModal() {
    if (!formRef.current) {
      setScheduleModalOpen(true);
      return;
    }

    const validationError = validateBeforeSubmit(formRef.current, { forSchedule: true });
    if (validationError) {
      setClientError(validationError);
      return;
    }

    setClientError(null);
    setScheduleModalOpen(true);
  }

  function clearScheduledDateInput() {
    if (scheduledDateInputRef.current) {
      scheduledDateInputRef.current.value = "";
    }
  }

  const insufficientJetonsMessage = t("filmCreation.errors.insufficientJetons");
  const showJetonPurchaseCta =
    insufficientJetons ||
    clientError === insufficientJetonsMessage ||
    state.error === insufficientJetonsMessage;

  const showScheduleAsPrimaryCta =
    !cooldownActive &&
    !isSampleFilm &&
    subscriptionGrantActive &&
    subscriptionGrantSchedule.canScheduleMore;

  const canShowScheduleLink =
    !showScheduleAsPrimaryCta &&
    !cooldownActive &&
    !isSampleFilm &&
    (!hasActiveSubscription || effectiveTicketBalance > 0);

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      onSubmit={handleSubmit}
      className="film-creation-form flex flex-col gap-8 sm:gap-10"
    >
      <input ref={scheduledDateInputRef} type="hidden" name="scheduledDate" defaultValue="" />
      <fieldset className="film-creation-form__themes">
        <legend className="font-display text-lg font-semibold text-cream md:text-xl">
          {t("filmCreation.form.themesLegend")}
        </legend>
        <p className="film-creation-form__themes-hint text-sm text-cream/50">
          {t("filmCreation.form.themesHint")}
        </p>
        <FilmThemePicker
          selectedThemes={selectedThemes}
          onSelectedThemesChange={setSelectedThemes}
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-lg font-semibold text-cream md:text-xl">
          {t("filmCreation.form.characterLegend")}
        </legend>

        {characters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-cinema-night/40 p-6 text-center">
            <p className="text-sm text-cream/55">
              {t("filmCreation.form.noCharacters")}
            </p>
            <Link
              href="/mon-espace?section=personnages"
              className="mt-4 inline-flex text-sm font-medium text-gold-light hover:text-gold"
            >
              {t("filmCreation.form.addCharacters")}
            </Link>
          </div>
        ) : eligibleCharacters.length === 0 ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-6 text-center">
            <p className="text-sm text-amber-100/90">
              {t(
                missingPhoto.length > 0
                  ? "filmCreation.form.noPhoto"
                  : "filmCreation.form.noAudio"
              )}
            </p>
            <Link
              href="/mon-espace?section=personnages"
              className="mt-4 inline-flex text-sm font-medium text-gold-light hover:text-gold"
            >
              {t("filmCreation.form.manageCharactersLink")}
            </Link>
          </div>
        ) : (
          <CharacterFacePicker
            eligible={eligibleCharacters}
            missingPhoto={missingPhoto}
            selectedCharacterIds={selectedCharacterIds}
            onSelectedCharacterIdsChange={setSelectedCharacterIds}
          />
        )}
      </fieldset>

      <FilmDurationPicker
        value={durationSeconds}
        onChange={setDurationSeconds}
        jetonBalance={jetonBalance}
        ticketBalance={effectiveTicketBalance}
        hasActiveSubscription={hasActiveSubscription}
        subscriptionGrantMode={subscriptionGrantActive}
      />

      <YesNoTextField
        question={t("filmCreation.form.avoidQuestion")}
        choiceName="avoidChoice"
        textName="avoid"
        textId="avoid"
        placeholder={t("filmCreation.form.avoidPlaceholder")}
        hint={t("filmCreation.form.avoidHint")}
        choice={avoidChoice}
        onChoiceChange={setAvoidChoice}
        text={avoidText}
        onTextChange={setAvoidText}
      />

      <YesNoTextField
        question={t("filmCreation.form.storyQuestion")}
        choiceName="storyChoice"
        textName="additionalInfo"
        textId="additionalInfo"
        placeholder={t("filmCreation.form.storyPlaceholder")}
        hint={t("filmCreation.form.storyHint")}
        choice={storyChoice}
        onChoiceChange={setStoryChoice}
        text={storyText}
        onTextChange={setStoryText}
      />

      {showJetonPurchaseCta ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-950/30 px-4 py-4 text-center">
          <p className="text-sm text-amber-100/95">{insufficientJetonsMessage}</p>
          <Link
            href="/abonnements"
            className={`mt-4 inline-flex ${BTN_3D_PRIMARY_ACTION}`}
          >
            {t("filmCreation.errors.samplePurchaseCta")}
          </Link>
        </div>
      ) : (clientError || state.error) ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {clientError ?? state.error}
        </p>
      ) : null}

      <div className="film-create-submit-wrap">
        {cooldownActive && cooldownEndsAt ? (
          <FilmCreationCooldown
            endsAt={cooldownEndsAt}
            onCooldownEnd={() => setCooldownActive(false)}
          />
        ) : subscriptionGrantActive && !subscriptionGrantSchedule.canScheduleMore ? (
          <p className="rounded-xl border border-amber-500/35 bg-amber-950/30 px-4 py-4 text-center text-sm text-amber-100/95">
            {t("filmCreation.scheduleFilm.quotaReached")}
          </p>
        ) : showScheduleAsPrimaryCta ? (
          <button
            type="button"
            disabled={pending || eligibleCharacters.length === 0}
            onClick={handleOpenScheduleModal}
            className={`${BTN_FILM_CREATE_SUBMIT} film-create-submit--solo`}
          >
            {pending ? (
              <span className="film-create-submit__pending">
                {t("filmCreation.form.pending")}
              </span>
            ) : (
              <span className="film-create-submit__label">
                {t("filmCreation.scheduleFilm.confirm")}
              </span>
            )}
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending || eligibleCharacters.length === 0}
            onClick={clearScheduledDateInput}
            className={`${BTN_FILM_CREATE_SUBMIT}${
              insufficientTickets || insufficientJetons ? " film-create-submit--blocked" : ""
            }${!showCreateCostBadge || pending ? " film-create-submit--solo" : ""}`}
            aria-disabled={insufficientTickets || insufficientJetons || undefined}
          >
            {pending ? (
              <span className="film-create-submit__pending">
                {t("filmCreation.form.pending")}
              </span>
            ) : (
              <>
                <span className="film-create-submit__label">
                  {t("filmCreation.form.submit")}
                </span>
                {showPaidTicketBadge ? (
                  <span className="film-create-submit__cost">
                    <TicketCountPill
                      count={ticketsRequired}
                      size="onPrimary"
                      label={ticketCostLabel(ticketsRequired)}
                    />
                  </span>
                ) : durationSeconds != null && isSampleFilm ? (
                  <span className="film-create-submit__cost">
                    <JetonCountPill
                      count={JETONS_REQUIRED_FOR_SAMPLE}
                      size="onPrimary"
                      label={jetonCostLabel(JETONS_REQUIRED_FOR_SAMPLE)}
                    />
                  </span>
                ) : null}
              </>
            )}
          </button>
        )}
        {canShowScheduleLink ? (
          <div className="film-create-schedule">
            <button
              type="button"
              className="film-create-schedule__link"
              disabled={pending}
              onClick={handleOpenScheduleModal}
            >
              {t("filmCreation.scheduleFilm.link")}
            </button>
          </div>
        ) : null}
      </div>

      <ScheduleFilmModal
        open={scheduleModalOpen}
        registrationDate={registrationDate}
        occupiedDates={occupiedScheduleDates}
        pending={pending}
        ticketsRequired={ticketsRequired}
        ticketBalance={effectiveTicketBalance}
        hasActiveSubscription={hasActiveSubscription}
        insufficientTickets={insufficientTickets}
        allowScheduleWithoutTickets={showScheduleAsPrimaryCta}
        subscriptionGrantSchedule={subscriptionGrantSchedule}
        onSchedule={handleScheduleFilm}
        onClose={() => setScheduleModalOpen(false)}
      />
    </form>
  );
}
