"use client";

import Image from "next/image";
import { useLocale } from "@/components/LocaleProvider";
import {
  FILM_CREATION_STYLES,
  FILM_STYLE_PREVIEW_SRC,
  type FilmCreationStyle,
} from "@/lib/film-creation/style-picker";
import { SURFACE_3D_CARD_SELECTABLE } from "@/lib/ui/button-3d-classes";
import type { TranslationKey } from "@/lib/i18n/translator";

function styleLabelKey(id: FilmCreationStyle): TranslationKey {
  return `filmCreation.styles.${id}` as TranslationKey;
}

type FilmStylePickerProps = {
  selectedStyle: FilmCreationStyle;
  onSelectedStyleChange: (style: FilmCreationStyle) => void;
};

export function FilmStylePicker({
  selectedStyle,
  onSelectedStyleChange,
}: FilmStylePickerProps) {
  const { t } = useLocale();

  return (
    <div
      className="film-style-picker"
      role="radiogroup"
      aria-label={t("filmCreation.form.styleLegend")}
    >
      {FILM_CREATION_STYLES.map((id) => {
        const isSelected = selectedStyle === id;
        const label = t(styleLabelKey(id));

        return (
          <label
            key={id}
            className={`${SURFACE_3D_CARD_SELECTABLE} film-style-picker__card${
              isSelected ? " film-style-picker__card--selected" : ""
            }`}
          >
            <input
              type="radio"
              name="style"
              value={id}
              checked={isSelected}
              onChange={() => onSelectedStyleChange(id)}
              className="peer sr-only"
            />
            <div className="film-style-picker__visual">
              <Image
                src={FILM_STYLE_PREVIEW_SRC[id]}
                alt={t("filmCreation.form.stylePreviewAlt", { style: label })}
                fill
                className="object-cover"
                sizes="(max-width: 639px) 48vw, 280px"
              />
            </div>
            <span className="film-style-picker__label">{label}</span>
          </label>
        );
      })}
    </div>
  );
}