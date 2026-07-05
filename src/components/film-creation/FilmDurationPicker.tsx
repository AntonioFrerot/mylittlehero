"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  SITE_JETON_HEIGHT,
  SITE_JETON_SRC,
  SITE_JETON_WIDTH,
  SITE_TICKET_IMAGE_HEIGHT,
  SITE_TICKET_IMAGE_WIDTH,
  SITE_TICKET_SRC,
} from "@/lib/brand";
import { formatFilmDurationSeconds } from "@/lib/film-creation/duration";
import {
  FREE_FILM_DURATION_SECONDS,
  getMaxAffordablePaidStepIndex,
  getTicketsRequiredForDuration,
  isPaidFilmDuration,
  JETONS_REQUIRED_FOR_SAMPLE,
  PAID_FILM_DURATION_SECONDS,
  SAMPLE_FILM_DURATION_SECONDS,
} from "@/lib/purchases/ticket-rules";
import { SURFACE_3D_FORM_CONTROL } from "@/lib/ui/button-3d-classes";
import { useTicketBalance } from "@/hooks/use-ticket-balance";
import { InsufficientTicketsModal } from "@/components/film-creation/InsufficientTicketsModal";

type FilmDurationPickerProps = {
  value: number | null;
  onChange: (seconds: number) => void;
  freeFilmAvailable?: boolean;
  freeTrialIntent?: boolean;
  jetonBalance?: number;
  ticketBalance?: number;
  hasActiveSubscription?: boolean;
  subscriptionGrantMode?: boolean;
};

export function FilmDurationPicker({
  value,
  onChange,
  freeFilmAvailable = false,
  freeTrialIntent = false,
  jetonBalance = 0,
  ticketBalance = 0,
  hasActiveSubscription = false,
  subscriptionGrantMode = false,
}: FilmDurationPickerProps) {
  const { locale, t } = useLocale();
  const displayLocale = locale === "fr" ? "fr" : "en";
  const { balance: liveTicketBalance } = useTicketBalance();
  const effectiveTicketBalance = liveTicketBalance ?? ticketBalance;
  const paidSteps = PAID_FILM_DURATION_SECONDS;
  const ticketGatingActive = !hasActiveSubscription || subscriptionGrantMode;
  const maxAffordableStepIndex = ticketGatingActive
    ? subscriptionGrantMode
      ? 0
      : getMaxAffordablePaidStepIndex(effectiveTicketBalance, paidSteps)
    : paidSteps.length - 1;
  const isPaidSelection = value != null && isPaidFilmDuration(value);
  const paidStepIndex = isPaidSelection
    ? paidSteps.indexOf(value as (typeof paidSteps)[number])
    : -1;
  const [lastPaidStepIndex, setLastPaidStepIndex] = useState(0);
  const [sampleJetonChoice, setSampleJetonChoice] = useState<"yes" | "no">("no");
  const [insufficientTicketsModal, setInsufficientTicketsModal] = useState<{
    open: boolean;
    ticketsRequired?: number;
  }>({ open: false });
  const sliderStepIndex = paidStepIndex >= 0 ? paidStepIndex : lastPaidStepIndex;
  const stepProgress =
    paidSteps.length > 1 ? (sliderStepIndex / (paidSteps.length - 1)) * 100 : 0;
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function selectDuration(seconds: number) {
    onChange(seconds);
  }

  function selectPaidStep(index: number) {
    const clamped = Math.max(0, Math.min(paidSteps.length - 1, index));
    const seconds = paidSteps[clamped];
    if (seconds != null) {
      setLastPaidStepIndex(clamped);
      selectDuration(seconds);
    }
  }

  function isStepLocked(index: number): boolean {
    return ticketGatingActive && index > maxAffordableStepIndex;
  }

  function openInsufficientTicketsModal(ticketsRequired: number) {
    setInsufficientTicketsModal({ open: true, ticketsRequired });
  }

  function attemptSelectPaidStep(index: number) {
    const clamped = Math.max(0, Math.min(paidSteps.length - 1, index));
    if (isStepLocked(clamped)) {
      const seconds = paidSteps[clamped];
      openInsufficientTicketsModal(
        seconds != null ? getTicketsRequiredForDuration(seconds) : 1
      );
      return;
    }
    selectPaidStep(clamped);
  }

  function stepIndexFromPointer(clientX: number): number {
    const track = trackRef.current;
    if (!track) return sliderStepIndex;

    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return sliderStepIndex;

    const ratio = (clientX - rect.left) / rect.width;
    return Math.round(ratio * paidSteps.length - 0.5);
  }

  function handleTrackPointerDown(event: PointerEvent<HTMLDivElement>) {
    const targetIndex = stepIndexFromPointer(event.clientX);
    if (isStepLocked(targetIndex)) {
      const seconds = paidSteps[targetIndex];
      openInsufficientTicketsModal(
        seconds != null ? getTicketsRequiredForDuration(seconds) : 1
      );
      return;
    }
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    selectPaidStep(targetIndex);
  }

  function handleTrackPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const targetIndex = stepIndexFromPointer(event.clientX);
    if (isStepLocked(targetIndex)) {
      const seconds = paidSteps[targetIndex];
      openInsufficientTicketsModal(
        seconds != null ? getTicketsRequiredForDuration(seconds) : 1
      );
      return;
    }
    selectPaidStep(targetIndex);
  }

  function handleTrackPointerUp(event: PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleTrackKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      attemptSelectPaidStep(sliderStepIndex + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      attemptSelectPaidStep(sliderStepIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      attemptSelectPaidStep(0);
    } else if (event.key === "End") {
      event.preventDefault();
      attemptSelectPaidStep(paidSteps.length - 1);
    }
  }

  function handleSampleJetonChoice(next: "yes" | "no") {
    setSampleJetonChoice(next);
    if (next === "yes") {
      selectDuration(SAMPLE_FILM_DURATION_SECONDS);
      return;
    }
    selectPaidStep(lastPaidStepIndex);
  }

  function jetonLabel(count: number): string {
    return count === 1
      ? t("filmCreation.form.oneJeton")
      : t("filmCreation.form.jetonsCount", { count });
  }

  function ticketLabel(count: number): string {
    return count === 1
      ? t("filmCreation.form.oneTicket")
      : t("filmCreation.form.ticketsCount", { count });
  }

  const sliderStyle = {
    "--duration-step-count": paidSteps.length,
    "--duration-step-index": sliderStepIndex,
    "--duration-step-progress": `${stepProgress}%`,
  } as CSSProperties;

  const showDurationSlider = jetonBalance <= 0 || sampleJetonChoice === "no";
  const hasExtraOptions = freeFilmAvailable && freeTrialIntent;

  return (
    <fieldset className="film-creation-form__themes">
      <legend className="font-display text-lg font-semibold text-cream md:text-xl">
        {t("filmCreation.form.durationLegend")}
      </legend>
      <p className="film-creation-form__themes-hint text-sm text-cream/50">
        {t("filmCreation.form.durationHint")}
      </p>

      <input type="hidden" name="duration" value={value ?? ""} />

      <div
        className={`${SURFACE_3D_FORM_CONTROL} duration-panel duration-slider`}
        style={sliderStyle}
      >
        {jetonBalance > 0 ? (
          <div className="duration-sample-choice">
            <div className="duration-sample-choice__content">
              <p className="duration-sample-choice__question">
                {t("filmCreation.form.durationSampleQuestion")}
              </p>
              <p className="duration-sample-choice__hint">
                {t("filmCreation.form.durationSampleYesHint")}
              </p>
            </div>
            <div
              className="duration-sample-choice__options"
              role="radiogroup"
              aria-label={t("filmCreation.form.durationSampleQuestion")}
            >
              <label className="duration-sample-choice__option">
                <input
                  type="radio"
                  name="sampleJetonChoice"
                  value="yes"
                  checked={sampleJetonChoice === "yes"}
                  onChange={() => handleSampleJetonChoice("yes")}
                  className="duration-sample-choice__input"
                />
                {t("common.yes")}
              </label>
              <label className="duration-sample-choice__option">
                <input
                  type="radio"
                  name="sampleJetonChoice"
                  value="no"
                  checked={sampleJetonChoice === "no"}
                  onChange={() => handleSampleJetonChoice("no")}
                  className="duration-sample-choice__input"
                />
                {t("common.no")}
              </label>
            </div>
          </div>
        ) : null}

        {showDurationSlider ? (
          <>
            {jetonBalance > 0 ? (
              <div className="duration-panel__divider" aria-hidden />
            ) : null}
            <div
              className="duration-slider__grid"
              role="group"
              aria-label={t("filmCreation.form.durationSliderLabel")}
            >
            {paidSteps.map((seconds, index) => {
              const tickets = getTicketsRequiredForDuration(seconds);
              const isActive = isPaidSelection && paidStepIndex === index;
              const isLocked = isStepLocked(index);
              const column = index + 1;

              return (
                <div
                  key={seconds}
                  className={`duration-slider__col ${
                    isActive ? "duration-slider__col--active" : ""
                  } ${isLocked ? "duration-slider__col--locked" : ""}`}
                  style={{ gridColumn: column }}
                >
                  <button
                    type="button"
                    className="duration-slider__ticket-btn"
                    onClick={() => attemptSelectPaidStep(index)}
                    aria-pressed={isActive}
                    aria-label={t("filmCreation.form.durationStepAria", {
                      duration: formatFilmDurationSeconds(seconds, displayLocale),
                      ticketLabel: ticketLabel(tickets),
                    })}
                  >
                    <span className="duration-slider__ticket" aria-hidden>
                      <span className="duration-slider__ticket-icon gold-ticket__icon">
                        <Image
                          src={SITE_TICKET_SRC}
                          alt=""
                          width={SITE_TICKET_IMAGE_WIDTH}
                          height={SITE_TICKET_IMAGE_HEIGHT}
                          className="gold-ticket__img"
                          sizes="44px"
                        />
                      </span>
                      <span className="duration-slider__ticket-count">{tickets}</span>
                    </span>
                  </button>

                  <div className="duration-slider__marker" aria-hidden />

                  <button
                    type="button"
                    tabIndex={-1}
                    className="duration-slider__duration-btn"
                    onClick={() => attemptSelectPaidStep(index)}
                  >
                    <span className="duration-slider__duration-label">
                      {formatFilmDurationSeconds(seconds, displayLocale)}
                    </span>
                  </button>
                </div>
              );
            })}

            <div ref={trackRef} className="duration-slider__track-layer">
              <div className="duration-slider__track-rail" aria-hidden>
                <div className="duration-slider__track-fill" />
              </div>
              {paidSteps.map((seconds, index) => (
                <span
                  key={`tick-${seconds}`}
                  className={`duration-slider__tick ${
                    index <= sliderStepIndex ? "duration-slider__tick--active" : ""
                  }`}
                  style={{ "--duration-tick-index": index } as CSSProperties}
                  aria-hidden
                />
              ))}
              <div
                className="duration-slider__track-hit"
                role="slider"
                tabIndex={0}
                aria-label={t("filmCreation.form.durationSliderLabel")}
                aria-valuemin={0}
                aria-valuemax={paidSteps.length - 1}
                aria-valuenow={sliderStepIndex}
                aria-valuetext={formatFilmDurationSeconds(
                  paidSteps[sliderStepIndex]!,
                  displayLocale
                )}
                onKeyDown={handleTrackKeyDown}
                onPointerDown={handleTrackPointerDown}
                onPointerMove={handleTrackPointerMove}
                onPointerUp={handleTrackPointerUp}
                onPointerCancel={handleTrackPointerUp}
              />
              <div className="duration-slider__thumb" aria-hidden />
            </div>
          </div>
          </>
        ) : (
          <div className="duration-sample-selected">
            <span className="duration-sample-selected__duration">
              {formatFilmDurationSeconds(
                SAMPLE_FILM_DURATION_SECONDS,
                displayLocale
              )}
            </span>
            <span className="duration-sample-selected__badge">
              <span className="gold-ticket__icon">
                <Image
                  src={SITE_JETON_SRC}
                  alt=""
                  width={SITE_JETON_WIDTH}
                  height={SITE_JETON_HEIGHT}
                  className="gold-ticket__img duration-extra-option__jeton-img"
                  sizes="40px"
                />
              </span>
              {jetonLabel(JETONS_REQUIRED_FOR_SAMPLE)}
            </span>
          </div>
        )}

        {hasExtraOptions ? (
          <>
            <div className="duration-panel__divider" aria-hidden />
            <div className="duration-extra-options">
              {freeFilmAvailable && freeTrialIntent ? (
                <label
                  className={`btn-3d btn-3d--soft duration-extra-option ${
                    value === FREE_FILM_DURATION_SECONDS
                      ? "duration-extra-option--active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="durationChoice"
                    value={FREE_FILM_DURATION_SECONDS}
                    checked={value === FREE_FILM_DURATION_SECONDS}
                    onChange={() => selectDuration(FREE_FILM_DURATION_SECONDS)}
                    className="sr-only"
                  />
                  <span className="duration-extra-option__text">
                    <span className="duration-extra-option__title">
                      {formatFilmDurationSeconds(
                        FREE_FILM_DURATION_SECONDS,
                        displayLocale
                      )}
                    </span>
                    <span className="duration-extra-option__hint">
                      {t("filmCreation.form.durationFreeOnce")}
                    </span>
                  </span>
                  <span className="duration-extra-option__badge duration-extra-option__badge--free">
                    {t("filmCreation.form.durationFreeBadge")}
                  </span>
                </label>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <InsufficientTicketsModal
        open={insufficientTicketsModal.open}
        ticketBalance={effectiveTicketBalance}
        ticketsRequired={insufficientTicketsModal.ticketsRequired}
        onClose={() => setInsufficientTicketsModal({ open: false })}
      />
    </fieldset>
  );
}
