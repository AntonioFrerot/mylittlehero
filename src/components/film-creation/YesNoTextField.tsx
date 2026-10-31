"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { YesNoChoice } from "@/lib/film-creation/form-draft";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-cinema-black/60 px-4 py-3 text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30";

type YesNoTextFieldProps = {
  question: string;
  choiceName: string;
  textName: string;
  textId: string;
  placeholder: string;
  hint?: string;
  choice: YesNoChoice | null;
  onChoiceChange: (choice: YesNoChoice) => void;
  text: string;
  onTextChange: (text: string) => void;
};

export function YesNoTextField({
  question,
  choiceName,
  textName,
  textId,
  placeholder,
  hint,
  choice,
  onChoiceChange,
  text,
  onTextChange,
}: YesNoTextFieldProps) {
  const { t } = useLocale();
  const showText = choice === "yes";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-cream md:text-xl">
            {question}
          </p>
          {hint && <p className="mt-2 text-sm text-cream/50">{hint}</p>}
        </div>
        <div
          className="flex shrink-0 items-center gap-5 sm:pt-1"
          role="radiogroup"
          aria-label={question}
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm text-cream/80">
            <input
              type="radio"
              name={choiceName}
              value="yes"
              checked={choice === "yes"}
              className="h-4 w-4 border-white/20 bg-cinema-black text-gold accent-gold"
              onChange={() => onChoiceChange("yes")}
            />
            {t("common.yes")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-cream/80">
            <input
              type="radio"
              name={choiceName}
              value="no"
              checked={choice === "no"}
              className="h-4 w-4 border-white/20 bg-cinema-black text-gold accent-gold"
              onChange={() => onChoiceChange("no")}
            />
            {t("common.no")}
          </label>
        </div>
      </div>

      {showText && (
        <textarea
          id={textId}
          name={textName}
          rows={4}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          className={`${inputClass} min-h-[100px] resize-y`}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
