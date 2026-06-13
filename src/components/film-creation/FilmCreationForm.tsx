"use client";

import { useActionState, useState, type FormEvent } from "react";
import { useTicketBalance } from "@/hooks/use-ticket-balance";
import {
  getTicketsRequiredForDuration,
  isFreeTrialFilmDuration,
} from "@/lib/purchases/ticket-rules";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import {
  saveFilmCreation,
  type FilmCreationFormState,
} from "@/lib/film-creation/actions";
import { CharacterFacePicker } from "@/components/film-creation/CharacterFacePicker";
import { FilmThemePicker } from "@/components/film-creation/FilmThemePicker";
import { FilmDurationPicker } from "@/components/film-creation/FilmDurationPicker";
import { YesNoTextField } from "@/components/film-creation/YesNoTextField";
import { TicketCountPill } from "@/components/tickets/TicketCountPill";
import {
  BTN_3D_PRIMARY_ACTION,
  BTN_3D_SECONDARY_ACTION_LG,
  BTN_FILM_CREATE_SUBMIT,
} from "@/lib/ui/button-3d-classes";
import type { Character } from "@/lib/characters/types";

const initialState: FilmCreationFormState = {};

type FilmCreationFormProps = {
  characters: Character[];
  ticketBalance: number;
  hasActiveSubscription: boolean;
  freeFilmAvailable: boolean;
};

export function FilmCreationForm({
  characters,
  ticketBalance,
  hasActiveSubscription,
  freeFilmAvailable,
}: FilmCreationFormProps) {
  const { t } = useLocale();
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    saveFilmCreation,
    initialState
  );
  const { balance: liveBalance } = useTicketBalance();
  const effectiveTicketBalance = liveBalance ?? ticketBalance;

  const isFreeFilm =
    durationSeconds != null && isFreeTrialFilmDuration(durationSeconds);
  const ticketsRequired =
    durationSeconds != null
      ? isFreeFilm
        ? 0
        : getTicketsRequiredForDuration(durationSeconds)
      : 0;
  const insufficientTickets =
    durationSeconds != null &&
    !isFreeFilm &&
    !hasActiveSubscription &&
    effectiveTicketBalance < ticketsRequired;

  function ticketCostLabel(count: number): string {
    return count === 1
      ? t("filmCreation.form.oneTicket")
      : t("filmCreation.form.ticketsCount", { count });
  }

  const eligibleCharacters = characters.filter((c) => c.photoSrc);
  const missingPhoto = characters.filter((c) => !c.photoSrc);

  function validateBeforeSubmit(form: HTMLFormElement): string | null {
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
    if (insufficientTickets) {
      return t("filmCreation.errors.insufficientTickets");
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
  }

  const insufficientTicketsMessage = t("filmCreation.errors.insufficientTickets");
  const showTicketPurchaseCta =
    !hasActiveSubscription &&
    (insufficientTickets ||
      clientError === insufficientTicketsMessage ||
      state.error === insufficientTicketsMessage);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-8 text-center">
        <p className="font-display text-xl font-semibold text-cream">
          {t("common.thankYou")}
        </p>
        <p className="mt-3 text-cream/65">{state.success}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/mon-espace?section=films"
            className={BTN_3D_PRIMARY_ACTION}
          >
            {t("filmCreation.form.viewFilms")}
          </Link>
          <Link
            href="/mon-espace?section=personnages"
            className={BTN_3D_SECONDARY_ACTION_LG}
          >
            {t("filmCreation.manageCharacters")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={handleSubmit}
      className="film-creation-form flex flex-col gap-8 sm:gap-10"
    >
      <fieldset className="film-creation-form__themes">
        <legend className="font-display text-lg font-semibold text-cream md:text-xl">
          {t("filmCreation.form.themesLegend")}
        </legend>
        <p className="film-creation-form__themes-hint text-sm text-cream/50">
          {t("filmCreation.form.themesHint")}
        </p>
        <FilmThemePicker />
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
              {t("filmCreation.form.noPhoto")}
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
          />
        )}
      </fieldset>

      <FilmDurationPicker
        value={durationSeconds}
        onChange={setDurationSeconds}
        freeFilmAvailable={freeFilmAvailable}
      />

      <YesNoTextField
        question={t("filmCreation.form.avoidQuestion")}
        choiceName="avoidChoice"
        textName="avoid"
        textId="avoid"
        placeholder={t("filmCreation.form.avoidPlaceholder")}
        hint={t("filmCreation.form.avoidHint")}
      />

      <YesNoTextField
        question={t("filmCreation.form.storyQuestion")}
        choiceName="storyChoice"
        textName="additionalInfo"
        textId="additionalInfo"
        placeholder={t("filmCreation.form.storyPlaceholder")}
        hint={t("filmCreation.form.storyHint")}
      />

      {showTicketPurchaseCta ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-950/30 px-4 py-4 text-center">
          <p className="text-sm text-amber-100/95">{insufficientTicketsMessage}</p>
          <Link
            href="/achat"
            className={`mt-4 inline-flex ${BTN_3D_PRIMARY_ACTION}`}
          >
            {t("filmCreation.errors.purchaseCta")}
          </Link>
        </div>
      ) : (clientError || state.error) ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {clientError ?? state.error}
        </p>
      ) : null}

      <div className="film-create-submit-wrap">
        <button
          type="submit"
          disabled={pending || eligibleCharacters.length === 0}
          className={`${BTN_FILM_CREATE_SUBMIT}${
            insufficientTickets ? " film-create-submit--blocked" : ""
          }`}
          aria-disabled={insufficientTickets || undefined}
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
              {!hasActiveSubscription && durationSeconds != null && !isFreeFilm ? (
                <span className="film-create-submit__cost">
                  <TicketCountPill
                    count={ticketsRequired}
                    size="onPrimary"
                    label={ticketCostLabel(ticketsRequired)}
                  />
                </span>
              ) : durationSeconds != null && isFreeFilm ? (
                <span className="film-create-submit__cost film-create-submit__cost--free">
                  {t("filmCreation.form.durationFreeBadge")}
                </span>
              ) : null}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
