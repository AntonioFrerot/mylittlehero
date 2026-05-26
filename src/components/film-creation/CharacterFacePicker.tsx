"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { formatCharacterAge } from "@/lib/characters/format";
import type { Character } from "@/lib/characters/types";

function formatMeta(character: Character): string | null {
  const parts: string[] = [];
  const ageLabel = formatCharacterAge(character.age);
  if (ageLabel) parts.push(ageLabel);
  if (character.taille) parts.push(`${character.taille} cm`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

type CharacterFacePickerProps = {
  eligible: Character[];
  missingPhoto: Character[];
};

export function CharacterFacePicker({
  eligible,
  missingPhoto,
}: CharacterFacePickerProps) {
  const { t } = useLocale();
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);

  const mainCharacterId = selectionOrder[0] ?? "";
  const hasSelection = selectionOrder.length > 0;

  function toggleCharacter(id: string, checked: boolean) {
    setSelectionOrder((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((entry) => entry !== id);
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream/50">{t("filmCreation.form.characterHint")}</p>

      {mainCharacterId ? (
        <input type="hidden" name="mainCharacter" value={mainCharacterId} />
      ) : null}

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        role="group"
        aria-label={t("filmCreation.form.characterAria")}
      >
        {eligible.map((character) => {
          const meta = formatMeta(character);
          const isSelected = selectionOrder.includes(character.id);
          const isMain = character.id === mainCharacterId;

          return (
            <label
              key={character.id}
              className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-cinema-night/60 transition-all duration-200 ease-out has-checked:border-gold/50 has-checked:bg-gold/10 has-checked:shadow-glow-gold-subtle hover:border-white/20 ${
                hasSelection ? "" : "items-center p-4"
              }`}
            >
              <input
                type="checkbox"
                name="characters"
                value={character.id}
                checked={isSelected}
                onChange={(event) =>
                  toggleCharacter(character.id, event.target.checked)
                }
                className="peer sr-only"
              />
              {hasSelection && (
                <div className="px-3 pt-2.5">
                  <div className="h-5 w-full shrink-0">
                    {isMain ? (
                      <span className="flex h-full w-full items-center justify-center rounded-md border border-gold/30 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-[10px] font-bold uppercase tracking-[0.14em] text-cinema-black">
                        {t("filmCreation.form.mainCharacterBadge")}
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
              <div
                className={`flex w-full flex-col items-center ${
                  hasSelection ? "px-4 pb-4 pt-2.5" : ""
                }`}
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 transition-colors peer-checked:border-gold/70 sm:h-24 sm:w-24">
                  <Image
                    src={character.photoSrc}
                    alt={t("common.photoOf", { name: character.prenom })}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80px, 96px"
                  />
                  <span
                    className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-cinema-black opacity-0 shadow-md transition-opacity peer-checked:opacity-100"
                    aria-hidden
                  >
                    ✓
                  </span>
                </div>
                <p className="mt-3 text-center font-display text-sm font-semibold text-cream/90 group-has-checked:text-gold-light">
                  {character.prenom}
                </p>
                {meta && (
                  <p className="mt-0.5 text-center text-xs text-cream/50">{meta}</p>
                )}
              </div>
            </label>
          );
        })}

        <Link
          href="/mon-espace?section=personnages"
          className={`group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-cinema-night/60 transition-all duration-200 ease-out hover:border-gold/40 hover:bg-gold/5 ${
            hasSelection ? "" : "items-center p-4"
          }`}
          aria-label={t("filmCreation.form.addCharacterAria")}
        >
          {hasSelection && (
            <div className="px-3 pt-2.5" aria-hidden>
              <div className="h-5 w-full shrink-0" />
            </div>
          )}
          <div
            className={`flex flex-col items-center ${
              hasSelection ? "px-4 pb-4 pt-2.5" : ""
            }`}
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-cinema-black/40 transition-colors group-hover:border-gold/50 sm:h-24 sm:w-24">
              <svg
                className="h-9 w-9 text-gold-light transition-transform group-hover:scale-105"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="mt-3 text-center font-display text-sm font-semibold text-cream/70 group-hover:text-gold-light">
              {t("filmCreation.form.addCharacterLabel")}
            </p>
          </div>
        </Link>
      </div>

      {missingPhoto.length > 0 && (
        <p className="text-xs text-amber-200/80">
          {t("filmCreation.form.missingPhotoList", {
            names: missingPhoto.map((c) => c.prenom).join(", "),
          })}
        </p>
      )}
    </div>
  );
}
