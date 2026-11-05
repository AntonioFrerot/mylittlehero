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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequiredFieldLabel } from "@/components/ui/RequiredFieldLabel";
import { CharacterPhotoUpload } from "@/components/espace/CharacterPhotoUpload";
import dynamic from "next/dynamic";
import {
  removeCharacter,
  upsertCharacter,
  type CharacterFormState,
} from "@/lib/characters/actions";
import { formatCharacterAge } from "@/lib/characters/format";
import type { Character } from "@/lib/characters/types";
import {
  CHARACTER_AUDIO_MAX_BYTES,
  CHARACTER_PHOTO_MAX_BYTES,
} from "@/lib/characters/upload-limits";
import {
  CHARACTER_AVATAR_IMAGE_QUALITY,
  isBlobPreviewPhoto,
} from "@/lib/characters/user-photo";

const CharacterAudioUpload = dynamic(
  () =>
    import("@/components/espace/CharacterAudioUpload").then(
      (module) => module.CharacterAudioUpload
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 animate-pulse rounded-xl border border-white/10 bg-cinema-night/60" />
    ),
  }
);

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
  const [clientError, setClientError] = useState<string | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [deletePending, setDeletePending] = useState(false);
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

  const startEdit = (character: Character) => setEditing(character);

  const confirmDeleteCharacter = async () => {
    if (!characterToDelete || deletePending) return;

    setDeletePending(true);
    const id = characterToDelete.id;
    const result = await removeCharacter(id);
    setDeletePending(false);

    if (result.error) {
      setClientError(result.error);
      setCharacterToDelete(null);
      return;
    }

    setCharacters((list) => list.filter((c) => c.id !== id));
    if (editing?.id === id) setEditing(null);
    setCharacterToDelete(null);
    router.refresh();
  };

  return (
    <div className="space-y-4 md:space-y-8 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:items-center lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
              {t("space.charactersTitle")}
            </h2>
            <span className="inline-flex w-fit max-w-full shrink-0 items-center rounded-full border border-emerald-400/25 bg-emerald-950/40 px-3 py-1 text-[0.68rem] font-semibold leading-snug text-emerald-100/95 sm:text-xs">
              {t("space.charactersPrivacyBadge")}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm text-cream/60 md:text-base lg:max-w-none">
            {t("space.charactersDesc")}
          </p>
        </div>
        <Button
          href={createFilmHref}
          variant="primary"
          className="w-full !text-sm shrink-0 sm:w-auto lg:justify-self-end"
        >
          {t("space.createFilm")}
        </Button>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-[minmax(300px,40%)_minmax(0,60%)] lg:items-start lg:gap-8 xl:gap-10">
      <div>
        {characters.length === 0 ? (
          <div className="hidden rounded-2xl border border-dashed border-white/15 bg-cinema-night/40 p-8 text-center md:block">
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
                          unoptimized={isBlobPreviewPhoto(character.photoSrc)}
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
                          {!character.audioSrc && (
                            <p className="mt-1 text-xs text-amber-200/80">
                              {t("characters.missingAudio")}
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
                            onClick={() => setCharacterToDelete(character)}
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
          encType="multipart/form-data"
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            setClientError(null);
            const form = event.currentTarget;
            const photoInput = form.elements.namedItem("photo");
            const audioInput = form.elements.namedItem("audio");
            const photoFile =
              photoInput instanceof HTMLInputElement ? photoInput.files?.[0] : undefined;
            const audioFile =
              audioInput instanceof HTMLInputElement ? audioInput.files?.[0] : undefined;

            if (photoFile && photoFile.size > CHARACTER_PHOTO_MAX_BYTES) {
              event.preventDefault();
              setClientError(t("characters.errors.photoTooLarge"));
              return;
            }
            if (audioFile && audioFile.size > CHARACTER_AUDIO_MAX_BYTES) {
              event.preventDefault();
              setClientError(t("characters.errors.audioTooLarge"));
            }
          }}
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <CharacterPhotoUpload
            currentPhotoSrc={editing?.photoSrc}
            prenom={editing?.prenom}
          />

          <CharacterAudioUpload currentAudioSrc={editing?.audioSrc} />

          <label className="flex flex-col gap-1.5 text-sm">
            <RequiredFieldLabel>{t("characters.prenom")}</RequiredFieldLabel>
            <input
              type="text"
              name="prenom"
              required
              defaultValue={editing?.prenom ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <RequiredFieldLabel>{t("characters.age")}</RequiredFieldLabel>
            <input
              type="text"
              name="age"
              required
              defaultValue={editing?.age ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <RequiredFieldLabel>{t("characters.taille")}</RequiredFieldLabel>
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

          {(clientError || state.error) && (
            <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {clientError ?? state.error}
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

      <ConfirmDialog
        open={characterToDelete != null}
        title={t("characters.deleteConfirmTitle")}
        message={
          characterToDelete
            ? t("characters.deleteConfirmMessage", {
                name: characterToDelete.prenom,
              })
            : ""
        }
        confirmLabel={t("characters.deleteConfirmButton")}
        cancelLabel={t("characters.deleteConfirmCancel")}
        pending={deletePending}
        onClose={() => {
          if (!deletePending) setCharacterToDelete(null);
        }}
        onConfirm={() => void confirmDeleteCharacter()}
      />
    </div>
  );
}
