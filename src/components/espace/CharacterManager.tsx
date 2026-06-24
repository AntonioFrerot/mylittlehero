"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BTN_3D_COMPACT_SECONDARY,
  BTN_3D_PRIMARY_ACTION,
  SURFACE_3D_PANEL,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";
import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { CharacterPhotoUpload } from "@/components/espace/CharacterPhotoUpload";
import {
  removeCharacter,
  upsertCharacter,
  type CharacterFormState,
} from "@/lib/characters/actions";
import { formatCharacterAge } from "@/lib/characters/format";
import type { Character } from "@/lib/characters/types";
import {
  CHARACTER_AVATAR_IMAGE_QUALITY,
  isUserCharacterPhoto,
} from "@/lib/characters/user-photo";

const initialState: CharacterFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type CharacterManagerProps = {
  initialCharacters: Character[];
  createFilmHref: string;
};

function formatMeta(character: Character): string {
  const parts: string[] = [];
  const ageLabel = formatCharacterAge(character.age);
  if (ageLabel) parts.push(ageLabel);
  if (character.taille) parts.push(`${character.taille} cm`);
  return parts.join(" · ");
}

export function CharacterManager({
  initialCharacters,
  createFilmHref,
}: CharacterManagerProps) {
  const { t } = useLocale();
  const router = useRouter();
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [characters, setCharacters] = useState(initialCharacters);
  const [editing, setEditing] = useState<Character | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [state, formAction, pending] = useActionState(upsertCharacter, initialState);

  useEffect(() => {
    setCharacters(initialCharacters);
  }, [initialCharacters]);

  useEffect(() => {
    if (!state.character) return;

    const saved = state.character;
    setCharacters((list) => {
      const index = list.findIndex((character) => character.id === saved.id);
      if (index >= 0) {
        const next = [...list];
        next[index] = saved;
        return next;
      }
      return [saved, ...list];
    });

    if (state.mode === "created") {
      setFormResetKey((key) => key + 1);
    }

    setEditing(null);
    router.refresh();
  }, [state.character, state.mode, router]);

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const startNew = () => {
    setEditing(null);
    scrollToForm();
  };
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
    <div className="space-y-8">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
              {t("space.charactersTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-cream/60 md:text-base">
              {t("space.charactersDesc")}
            </p>
          </div>
          <Button
            href={createFilmHref}
            variant="primary"
            className="w-full !text-sm shrink-0 sm:w-auto"
          >
            {t("space.createFilm")}
          </Button>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="mt-4 w-fit cursor-pointer text-sm text-gold-light transition-colors hover:text-gold"
        >
          {t("characters.addNew")}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
      <div>
        {characters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/40 p-8 text-center">
            <p className="text-cream/50">{t("characters.empty")}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {characters.map((character) => {
              const meta = formatMeta(character);
              return (
                <li
                  key={character.id}
                  className={`${SURFACE_3D_PANEL_LG} p-4 ${
                    editing?.id === character.id ? "!border-gold/45" : ""
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
                          sizes="112px"
                          quality={CHARACTER_AVATAR_IMAGE_QUALITY}
                          unoptimized={isUserCharacterPhoto(character.photoSrc)}
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
                            className={BTN_3D_COMPACT_SECONDARY}
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

      <div
        ref={formSectionRef}
        className={`${SURFACE_3D_PANEL} scroll-mt-24 rounded-2xl p-6 md:p-8`}
      >
        <h2 className="font-display text-xl font-semibold text-cream">
          {editing ? t("characters.formEditTitle") : t("characters.formAddTitle")}
        </h2>

        <form
          key={editing?.id ?? `new-${formResetKey}`}
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
          {state.success && state.mode === "updated" && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
              {state.success}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`mt-2 ${BTN_3D_PRIMARY_ACTION}`}
          >
            {pending
              ? editing
                ? t("common.saving")
                : t("characters.submitPendingAdd")
              : editing
                ? t("characters.submitEdit")
                : t("characters.submitAdd")}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
