"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { CharacterPhotoUpload } from "@/components/espace/CharacterPhotoUpload";
import {
  removeCharacter,
  upsertCharacter,
  type CharacterFormState,
} from "@/lib/characters/actions";
import { formatCharacterAge } from "@/lib/characters/format";
import type { Character } from "@/lib/characters/types";

const initialState: CharacterFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type CharacterManagerProps = {
  initialCharacters: Character[];
};

function formatMeta(character: Character): string {
  const parts: string[] = [];
  const ageLabel = formatCharacterAge(character.age);
  if (ageLabel) parts.push(ageLabel);
  if (character.taille) parts.push(`${character.taille} cm`);
  return parts.join(" · ");
}

export function CharacterManager({ initialCharacters }: CharacterManagerProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [characters, setCharacters] = useState(initialCharacters);
  const [editing, setEditing] = useState<Character | null>(null);
  const [state, formAction, pending] = useActionState(upsertCharacter, initialState);

  useEffect(() => {
    setCharacters(initialCharacters);
  }, [initialCharacters]);

  useEffect(() => {
    if (state.success) {
      setEditing(null);
      router.refresh();
    }
  }, [state.success, router]);

  const startNew = () => setEditing(null);
  const startEdit = (character: Character) => setEditing(character);

  const handleDelete = async (id: string) => {
    const result = await removeCharacter(id);
    if (!result.error) {
      setCharacters((list) => list.filter((c) => c.id !== id));
      if (editing?.id === id) setEditing(null);
      router.refresh();
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
            {t("characters.listTitle")}
          </h2>
          <button
            type="button"
            onClick={startNew}
            className="text-sm text-gold-light transition-colors hover:text-gold"
          >
            {t("characters.addNew")}
          </button>
        </div>
        <p className="mt-2 text-sm text-cream/55">{t("characters.listHint")}</p>

        {characters.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-cinema-night/40 p-8 text-center">
            <p className="text-cream/50">{t("characters.empty")}</p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {characters.map((character) => {
              const meta = formatMeta(character);
              return (
                <li
                  key={character.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    editing?.id === character.id
                      ? "border-gold/40 bg-gold/5"
                      : "border-white/10 bg-cinema-night/60 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-cinema-black">
                      {character.photoSrc ? (
                        <Image
                          src={character.photoSrc}
                          alt={t("common.photoOf", { name: character.prenom })}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-cream/30">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-semibold text-cream">
                            {character.prenom}
                          </p>
                          {meta && (
                            <p className="mt-0.5 text-xs font-medium text-gold-light/90">
                              {meta}
                            </p>
                          )}
                          {!character.photoSrc && (
                            <p className="mt-1 text-xs text-amber-200/80">
                              {t("characters.missingPhoto")}
                            </p>
                          )}
                          {character.additionalInfo && (
                            <p className="mt-2 line-clamp-3 text-sm text-cream/55">
                              {character.additionalInfo}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(character)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-cream/80 hover:bg-white/5"
                          >
                            {t("characters.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(character.id)}
                            className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300/90 hover:bg-red-950/30"
                          >
                            {t("characters.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-cinema-surface/80 p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold text-cream">
          {editing ? t("characters.formEditTitle") : t("characters.formAddTitle")}
        </h2>

        <form
          key={editing?.id ?? "new"}
          action={formAction}
          className="mt-6 flex flex-col gap-4"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <CharacterPhotoUpload
            currentPhotoSrc={editing?.photoSrc}
            prenom={editing?.prenom}
          />

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-cream/70">{t("characters.prenom")}</span>
            <input
              type="text"
              name="prenom"
              required
              defaultValue={editing?.prenom ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-cream/70">{t("characters.age")}</span>
            <input
              type="text"
              name="age"
              defaultValue={editing?.age ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-cream/70">{t("characters.taille")}</span>
            <input
              type="number"
              name="taille"
              required
              min={10}
              max={300}
              step={1}
              inputMode="numeric"
              defaultValue={editing?.taille ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-cream/70">{t("characters.additionalInfo")}</span>
            <textarea
              name="additionalInfo"
              rows={5}
              defaultValue={editing?.additionalInfo ?? ""}
              className={`${inputClass} resize-y min-h-[120px]`}
            />
          </label>

          {state.error && (
            <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
              {state.success}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 py-3 text-sm font-semibold text-cinema-black shadow-glow-gold transition-all hover:brightness-110 disabled:opacity-60"
          >
            {pending
              ? t("common.saving")
              : editing
                ? t("characters.submitEdit")
                : t("characters.submitAdd")}
          </button>
        </form>
      </div>
    </div>
  );
}
