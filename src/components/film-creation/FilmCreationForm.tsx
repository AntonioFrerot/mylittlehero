"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import {
  saveFilmCreation,
  type FilmCreationFormState,
} from "@/lib/film-creation/actions";
import { FILM_THEMES } from "@/lib/film-creation/types";
import { CharacterFacePicker } from "@/components/film-creation/CharacterFacePicker";
import { FilmDurationPicker } from "@/components/film-creation/FilmDurationPicker";
import { YesNoTextField } from "@/components/film-creation/YesNoTextField";
import type { Character } from "@/lib/characters/types";
import type { TranslationKey } from "@/lib/i18n/translator";

const initialState: FilmCreationFormState = {};

type FilmCreationFormProps = {
  characters: Character[];
};

function themeLabelKey(theme: (typeof FILM_THEMES)[number]): TranslationKey {
  return `filmCreation.themes.${theme}` as TranslationKey;
}

export function FilmCreationForm({ characters }: FilmCreationFormProps) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    saveFilmCreation,
    initialState
  );

  const eligibleCharacters = characters.filter((c) => c.photoSrc);
  const missingPhoto = characters.filter((c) => !c.photoSrc);

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
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 py-3 text-sm font-semibold text-cinema-black shadow-glow-gold"
          >
            {t("filmCreation.form.viewFilms")}
          </Link>
          <Link
            href="/mon-espace?section=personnages"
            className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-white/5 px-6 py-3 text-sm text-cream hover:border-gold/70"
          >
            {t("filmCreation.manageCharacters")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-8 sm:gap-10">
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-semibold text-cream md:text-xl">
          {t("filmCreation.form.themesLegend")}
        </legend>
        <p className="text-sm text-cream/50">{t("filmCreation.form.themesHint")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
          {FILM_THEMES.map((theme) => (
            <label
              key={theme}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-cinema-night/60 px-3 py-3 transition-all has-checked:border-gold/40 has-checked:bg-gold/10 hover:border-white/20"
            >
              <input
                type="checkbox"
                name="themes"
                value={theme}
                className="h-4 w-4 shrink-0 rounded border-white/20 bg-cinema-black text-gold accent-gold"
              />
              <span className="text-sm text-cream/85">{t(themeLabelKey(theme))}</span>
            </label>
          ))}
        </div>
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

      <FilmDurationPicker />

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

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || eligibleCharacters.length === 0}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-3.5 text-sm font-semibold text-cinema-black shadow-glow-gold transition-all hover:brightness-110 disabled:opacity-60 sm:w-auto"
      >
        {pending ? t("filmCreation.form.pending") : t("filmCreation.form.submit")}
      </button>
    </form>
  );
}
