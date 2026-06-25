"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SURFACE_3D_CARD_SELECTABLE, SURFACE_3D_CHECK_BADGE } from "@/lib/ui/button-3d-classes";
import { formatCharacterAge } from "@/lib/characters/format";
import type { Character } from "@/lib/characters/types";
import {
  CHARACTER_AVATAR_IMAGE_QUALITY,
  CHARACTER_PICKER_AVATAR_SIZES,
  isBlobPreviewPhoto,
} from "@/lib/characters/user-photo";

const SCROLL_CARD_COUNT = 3;
const SCROLL_EDGE_THRESHOLD = 6;

type ScrollNavState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

function formatMeta(character: Character): string | null {
  const parts: string[] = [];
  const ageLabel = formatCharacterAge(character.age);
  if (ageLabel) parts.push(ageLabel);
  if (character.taille) parts.push(`${character.taille} cm`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function getCardScrollStep(track: HTMLDivElement): number {
  const card = track.querySelector<HTMLElement>(".character-face-picker__card");
  if (!card) return track.clientWidth * 0.85;
  const gap = Number.parseFloat(getComputedStyle(track).gap || "0");
  return (card.offsetWidth + gap) * SCROLL_CARD_COUNT;
}

type CharacterScrollNavProps = {
  direction: "left" | "right";
  ariaLabel: string;
  onClick: () => void;
};

function CharacterScrollNav({
  direction,
  ariaLabel,
  onClick,
}: CharacterScrollNavProps) {
  return (
    <button
      type="button"
      className={`character-face-picker-rail__scroll-nav character-face-picker-rail__scroll-nav--${direction}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="character-face-picker-rail__scroll-nav-icon" aria-hidden>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {direction === "right" ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
        </svg>
      </span>
    </button>
  );
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
  const [selectedId, setSelectedId] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollNav, setScrollNav] = useState<ScrollNavState>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const syncScrollNav = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setScrollNav({
      canScrollLeft: track.scrollLeft > SCROLL_EDGE_THRESHOLD,
      canScrollRight:
        track.scrollLeft + track.clientWidth < track.scrollWidth - SCROLL_EDGE_THRESHOLD,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncScrollNav();
    track.addEventListener("scroll", syncScrollNav, { passive: true });
    window.addEventListener("resize", syncScrollNav);
    const resizeObserver = new ResizeObserver(syncScrollNav);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", syncScrollNav);
      window.removeEventListener("resize", syncScrollNav);
      resizeObserver.disconnect();
    };
  }, [eligible.length, syncScrollNav]);

  const scrollByCards = useCallback((direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const step = getCardScrollStep(track);
    track.scrollBy({
      left: direction === "right" ? step : -step,
      behavior: "smooth",
    });
  }, []);

  const showScrollNav = eligible.length > 3;

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream/50">{t("filmCreation.form.characterHint")}</p>

      {selectedId ? (
        <input type="hidden" name="mainCharacter" value={selectedId} />
      ) : null}

      <div className="character-face-picker">
        <div className="character-face-picker-rail">
          <div className="character-face-picker-rail__viewport">
            <div
              ref={trackRef}
              className="character-face-picker-rail__track scrollbar-hide"
              role="radiogroup"
              aria-label={t("filmCreation.form.characterAria")}
            >
              {eligible.map((character) => {
                const meta = formatMeta(character);
                const isSelected = selectedId === character.id;

                return (
                  <label
                    key={character.id}
                    className={`${SURFACE_3D_CARD_SELECTABLE} character-face-picker__card${
                      isSelected ? " character-face-picker__card--selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="characters"
                      value={character.id}
                      checked={isSelected}
                      onChange={() => setSelectedId(character.id)}
                      className="peer sr-only"
                      required
                    />
                    {isSelected ? (
                      <span className="character-face-picker__selected-tag">
                        {t("filmCreation.form.selectedCharacterBadge")}
                      </span>
                    ) : null}
                    <div className="character-face-picker__card-body">
                      <div className="character-face-picker__avatar">
                        <Image
                          src={character.photoSrc}
                          alt={t("common.photoOf", { name: character.prenom })}
                          fill
                          className="object-cover"
                          sizes={CHARACTER_PICKER_AVATAR_SIZES}
                          quality={CHARACTER_AVATAR_IMAGE_QUALITY}
                          unoptimized={isBlobPreviewPhoto(character.photoSrc)}
                        />
                        <span className={SURFACE_3D_CHECK_BADGE} aria-hidden>
                          ✓
                        </span>
                      </div>
                      <p className="character-face-picker__name">{character.prenom}</p>
                      {meta ? (
                        <p className="character-face-picker__meta">{meta}</p>
                      ) : null}
                    </div>
                  </label>
                );
              })}

              <Link
                href="/mon-espace?section=personnages"
                className={`${SURFACE_3D_CARD_SELECTABLE} character-face-picker__card character-face-picker__card--add`}
                aria-label={t("filmCreation.form.addCharacterAria")}
              >
                <div className="character-face-picker__card-body">
                  <div className="character-face-picker__avatar character-face-picker__avatar--add">
                    <svg
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
                  <p className="character-face-picker__name character-face-picker__name--add">
                    {t("filmCreation.form.addCharacterLabel")}
                  </p>
                </div>
              </Link>
            </div>
            {showScrollNav && scrollNav.canScrollLeft ? (
              <CharacterScrollNav
                direction="left"
                ariaLabel={t("filmCreation.form.characterScrollLeftAria")}
                onClick={() => scrollByCards("left")}
              />
            ) : null}
            {showScrollNav && scrollNav.canScrollRight ? (
              <CharacterScrollNav
                direction="right"
                ariaLabel={t("filmCreation.form.characterScrollRightAria")}
                onClick={() => scrollByCards("right")}
              />
            ) : null}
          </div>
        </div>
      </div>

      {missingPhoto.length > 0 ? (
        <p className="text-xs text-amber-200/80">
          {t("filmCreation.form.missingPhotoList", {
            names: missingPhoto.map((c) => c.prenom).join(", "),
          })}
        </p>
      ) : null}
    </div>
  );
}
