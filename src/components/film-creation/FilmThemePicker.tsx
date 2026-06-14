"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { FILM_THEMES } from "@/lib/film-creation/types";
import { BTN_FILM_THEME_VALIDATE, SURFACE_3D_CARD } from "@/lib/ui/button-3d-classes";
import type { TranslationKey } from "@/lib/i18n/translator";

const MOBILE_THEMES_MQ = "(max-width: 639px)";

function themeLabelKey(theme: (typeof FILM_THEMES)[number]): TranslationKey {
  return `filmCreation.themes.${theme}` as TranslationKey;
}

function subscribeMobileViewport(onChange: () => void) {
  const media = window.matchMedia(MOBILE_THEMES_MQ);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_THEMES_MQ).matches;
}

function getMobileViewportServerSnapshot() {
  return true;
}

const OUTSIDE_TAP_MOVE_THRESHOLD_PX = 10;

type OutsideGesture = {
  x: number;
  y: number;
  scrollX: number;
  scrollY: number;
  moved: boolean;
};

export function FilmThemePicker() {
  const { t } = useLocale();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const outsideTapRef = useRef<OutsideGesture | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const isMobile = useSyncExternalStore(
    subscribeMobileViewport,
    getMobileViewportSnapshot,
    getMobileViewportServerSnapshot
  );

  function openPanel() {
    setOpen(true);
  }

  function closePanel() {
    setOpen(false);
  }

  function toggleTheme(theme: string) {
    setSelected((prev) =>
      prev.includes(theme) ? prev.filter((id) => id !== theme) : [...prev, theme]
    );
  }

  function triggerLabel(): string {
    if (selected.length === 0) {
      return t("filmCreation.form.themesChoose");
    }
    if (selected.length === 1) {
      return t(themeLabelKey(selected[0] as (typeof FILM_THEMES)[number]));
    }
    return t("filmCreation.form.themesSelectedCount", { count: selected.length });
  }

  useEffect(() => {
    if (!open) return;

    function isOutside(target: EventTarget | null): boolean {
      return target instanceof Node && !rootRef.current?.contains(target);
    }

    function handlePointerDown(event: PointerEvent) {
      if (!isOutside(event.target)) {
        outsideTapRef.current = null;
        return;
      }

      outsideTapRef.current = {
        x: event.clientX,
        y: event.clientY,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        moved: false,
      };
    }

    function handlePointerMove(event: PointerEvent) {
      const gesture = outsideTapRef.current;
      if (!gesture || gesture.moved) return;

      const dx = Math.abs(event.clientX - gesture.x);
      const dy = Math.abs(event.clientY - gesture.y);
      if (dx > OUTSIDE_TAP_MOVE_THRESHOLD_PX || dy > OUTSIDE_TAP_MOVE_THRESHOLD_PX) {
        gesture.moved = true;
      }
    }

    function handleScroll() {
      const gesture = outsideTapRef.current;
      if (!gesture || gesture.moved) return;

      if (
        window.scrollX !== gesture.scrollX ||
        window.scrollY !== gesture.scrollY
      ) {
        gesture.moved = true;
      }
    }

    function handlePointerUp(event: PointerEvent) {
      const gesture = outsideTapRef.current;
      outsideTapRef.current = null;

      if (!gesture || gesture.moved || !isOutside(event.target)) return;
      closePanel();
    }

    function handlePointerCancel() {
      // Scroll ou reprise par le navigateur : ne pas fermer le panneau.
      outsideTapRef.current = null;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      outsideTapRef.current = null;
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  if (isMobile) {
    return (
      <>
        {selected.map((theme) => (
          <input key={theme} type="hidden" name="themes" value={theme} />
        ))}

        <div ref={rootRef} className="film-theme-dropdown">
          <button
            type="button"
            className={`film-theme-dropdown__trigger${open ? " film-theme-dropdown__trigger--open" : ""}${selected.length > 0 ? " film-theme-dropdown__trigger--filled" : ""}`}
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            onClick={() => (open ? closePanel() : openPanel())}
          >
            <span className="film-theme-dropdown__trigger-label">{triggerLabel()}</span>
            <svg
              className="film-theme-dropdown__chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {open ? (
            <div className="film-theme-dropdown__panel-wrap">
              <ul
                id={listId}
                className="film-theme-dropdown__panel"
                role="listbox"
                aria-multiselectable="true"
                aria-label={t("filmCreation.form.themesLegend")}
              >
                {FILM_THEMES.map((theme) => {
                  const isSelected = selected.includes(theme);
                  return (
                    <li key={theme} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        className={`film-theme-dropdown__option${isSelected ? " film-theme-dropdown__option--selected" : ""}`}
                        onClick={() => toggleTheme(theme)}
                      >
                        <span
                          className={`film-theme-dropdown__check${isSelected ? " film-theme-dropdown__check--on" : ""}`}
                          aria-hidden
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                        <span>{t(themeLabelKey(theme))}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="film-theme-dropdown__footer">
                <button
                  type="button"
                  className={BTN_FILM_THEME_VALIDATE}
                  onClick={closePanel}
                >
                  {t("filmCreation.form.themesValidate")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
      {FILM_THEMES.map((theme) => {
        const isSelected = selected.includes(theme);
        return (
          <label key={theme} className={SURFACE_3D_CARD}>
            <input
              type="checkbox"
              name="themes"
              value={theme}
              checked={isSelected}
              onChange={() => toggleTheme(theme)}
              className="h-4 w-4 shrink-0 rounded border-white/20 bg-cinema-black text-gold accent-gold"
            />
            <span className="text-sm text-cream/85">{t(themeLabelKey(theme))}</span>
          </label>
        );
      })}
    </div>
  );
}
