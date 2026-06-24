"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useLocale } from "@/components/LocaleProvider";
import {
  regenerateStoryForFilm,
  validateStoryForFilm,
  type StoryActionState,
} from "@/lib/story-generation/actions";
import type { StoryGenerationStatus } from "@/lib/story-generation/types";

type FilmStoryApprovalButtonsProps = {
  filmHref: string;
  filmId: string;
  storyStatus?: StoryGenerationStatus;
  storyValidatedAt?: string | null;
  storyRegenerationUsed?: boolean;
  hasResume?: boolean;
};

const initialState: StoryActionState = {};

function filmStoryActionsColsClass(buttonCount: number): string {
  if (buttonCount >= 3) return "film-story-actions--3";
  if (buttonCount === 2) return "film-story-actions--2";
  return "film-story-actions--1";
}

export function FilmStoryApprovalButtons({
  filmHref,
  filmId,
  storyStatus,
  storyValidatedAt,
  storyRegenerationUsed = false,
  hasResume = false,
}: FilmStoryApprovalButtonsProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [validateOpen, setValidateOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [validateState, validateAction, validatePending] = useActionState(
    validateStoryForFilm,
    initialState
  );
  const [regenerateState, regenerateAction, regeneratePending] = useActionState(
    regenerateStoryForFilm,
    initialState
  );
  const validateFormRef = useRef<HTMLFormElement>(null);
  const regenerateFormRef = useRef<HTMLFormElement>(null);

  const showApproval =
    storyStatus === "completed" && hasResume && !storyValidatedAt;
  const showRegenerate = showApproval && !storyRegenerationUsed;
  const buttonCount = 1 + (showApproval ? 1 : 0) + (showRegenerate ? 1 : 0);

  useEffect(() => {
    if (validateState.success) {
      setValidateOpen(false);
      router.refresh();
    }
  }, [validateState.success, router]);

  useEffect(() => {
    if (regenerateState.success) {
      setRegenerateOpen(false);
      router.refresh();
    }
  }, [regenerateState.success, router]);

  const feedbackMessage =
    validateState.error ||
    regenerateState.error ||
    validateState.success ||
    regenerateState.success;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div
        className={`film-story-actions ${filmStoryActionsColsClass(buttonCount)}`}
      >
        <Link
          href={filmHref}
          className="film-story-actions__btn film-story-actions__btn--watch"
        >
          {t("space.watchFilm")}
        </Link>
        {showApproval ? (
          <button
            type="button"
            className="film-story-actions__btn film-story-actions__btn--validate"
            onClick={() => setValidateOpen(true)}
          >
            {t("space.storyActions.validateButton")}
          </button>
        ) : null}
        {showRegenerate ? (
          <button
            type="button"
            className="film-story-actions__btn film-story-actions__btn--regenerate"
            onClick={() => setRegenerateOpen(true)}
          >
            {t("space.storyActions.regenerateButton")}
          </button>
        ) : null}
      </div>

      {feedbackMessage ? (
        <p
          className={`text-sm ${
            validateState.error || regenerateState.error
              ? "text-red-300/90"
              : "text-emerald-300/90"
          }`}
          role={validateState.error || regenerateState.error ? "alert" : "status"}
        >
          {feedbackMessage}
        </p>
      ) : null}

      <form ref={validateFormRef} action={validateAction} className="hidden">
        <input type="hidden" name="filmId" value={filmId} />
      </form>
      <form ref={regenerateFormRef} action={regenerateAction} className="hidden">
        <input type="hidden" name="filmId" value={filmId} />
      </form>

      <ConfirmDialog
        open={validateOpen}
        title={t("space.storyActions.validateTitle")}
        message={t("space.storyActions.validateMessage")}
        confirmLabel={t("space.storyActions.confirmButton")}
        cancelLabel={t("space.storyActions.cancelButton")}
        pending={validatePending}
        onClose={() => {
          if (!validatePending) setValidateOpen(false);
        }}
        onConfirm={() => {
          validateFormRef.current?.requestSubmit();
        }}
      />

      <ConfirmDialog
        open={regenerateOpen}
        title={t("space.storyActions.regenerateTitle")}
        message={t("space.storyActions.regenerateMessage")}
        confirmLabel={t("space.storyActions.confirmButton")}
        cancelLabel={t("space.storyActions.cancelButton")}
        pending={regeneratePending}
        onClose={() => {
          if (!regeneratePending) setRegenerateOpen(false);
        }}
        onConfirm={() => {
          regenerateFormRef.current?.requestSubmit();
        }}
      />
    </div>
  );
}
