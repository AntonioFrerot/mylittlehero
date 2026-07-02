"use client";

import Image from "next/image";
import { useEffect, useRef, type MouseEvent } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { getWelcomeSampleBubbleTargetCenter } from "@/lib/espace/welcome-sample-bubble-target";
import { getAbonnementsSampleOffer } from "@/lib/i18n/tarifs-catalog";
import { SITE_JETON_HEIGHT, SITE_JETON_SRC, SITE_JETON_WIDTH } from "@/lib/brand";
import { BTN_ABONNEMENTS_GOLD_CTA } from "@/lib/ui/button-3d-classes";

type WelcomeSampleOfferModalProps = {
  collapsing: boolean;
  onDecline: () => void;
  onCollapseComplete: () => void;
  onPurchaseStart: () => void;
};

const MORPH_MS = 90;
const FLY_MS = 580;
const COLLAPSE_MS = MORPH_MS + FLY_MS;

function startPanelCollapse(panel: HTMLDivElement) {
  const rect = panel.getBoundingClientRect();
  const target = getWelcomeSampleBubbleTargetCenter();
  const panelCenterX = rect.left + rect.width / 2;
  const panelCenterY = rect.top + rect.height / 2;
  const squareSize = Math.max(rect.width, rect.height) / 2;
  const scale = target.size / squareSize;

  panel.style.position = "fixed";
  panel.style.left = `${rect.left}px`;
  panel.style.top = `${rect.top}px`;
  panel.style.width = `${rect.width}px`;
  panel.style.height = `${rect.height}px`;
  panel.style.margin = "0";
  panel.style.maxWidth = "none";
  panel.style.transformOrigin = "center center";
  panel.style.setProperty("--welcome-sample-collapse-x", `${target.x - panelCenterX}px`);
  panel.style.setProperty("--welcome-sample-collapse-y", `${target.y - panelCenterY}px`);
  panel.style.setProperty("--welcome-sample-collapse-scale", `${scale}`);

  void panel.offsetWidth;
  panel.classList.add("welcome-sample-offer-modal__panel--collapse-morph");

  panel.style.left = `${panelCenterX - squareSize / 2}px`;
  panel.style.top = `${panelCenterY - squareSize / 2}px`;
  panel.style.width = `${squareSize}px`;
  panel.style.height = `${squareSize}px`;

  window.setTimeout(() => {
    panel.classList.add("welcome-sample-offer-modal__panel--collapse-fly");
  }, MORPH_MS);

  window.setTimeout(() => {
    panel.classList.add("welcome-sample-offer-modal__panel--collapse-fade");
  }, COLLAPSE_MS - 100);
}

export function WelcomeSampleOfferModal({
  collapsing,
  onDecline,
  onCollapseComplete,
  onPurchaseStart,
}: WelcomeSampleOfferModalProps) {
  const { locale, t } = useLocale();
  const offer = getAbonnementsSampleOffer(locale);
  const panelRef = useRef<HTMLDivElement>(null);
  const collapseStartedRef = useRef(false);
  const collapseDoneRef = useRef(false);
  const onCollapseCompleteRef = useRef(onCollapseComplete);

  useEffect(() => {
    onCollapseCompleteRef.current = onCollapseComplete;
  }, [onCollapseComplete]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const blockBackgroundScroll = (event: TouchEvent) => {
      event.preventDefault();
    };

    document.addEventListener("touchmove", blockBackgroundScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockBackgroundScroll);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (!collapsing || collapseStartedRef.current) return;

    const panel = panelRef.current;
    if (!panel) return;

    collapseStartedRef.current = true;
    collapseDoneRef.current = false;

    let frameId = 0;
    frameId = window.requestAnimationFrame(() => {
      frameId = window.requestAnimationFrame(() => {
        startPanelCollapse(panel);
      });
    });

    const finishCollapse = () => {
      if (collapseDoneRef.current) return;
      collapseDoneRef.current = true;
      onCollapseCompleteRef.current();
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      finishCollapse();
    };

    const timeoutId = window.setTimeout(finishCollapse, COLLAPSE_MS + 80);

    panel.addEventListener("transitionend", onTransitionEnd);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      panel.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [collapsing]);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (collapsing) return;
    if (panelRef.current?.contains(event.target as Node)) return;
    onDecline();
  };

  return (
    <div
      className={`welcome-sample-offer-modal fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 ${
        collapsing ? "welcome-sample-offer-modal--collapsing" : ""
      }`}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className={`welcome-sample-offer-modal__backdrop absolute inset-0 bg-cinema-black/82 backdrop-blur-md transition-opacity duration-500 ${
          collapsing ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-sample-offer-title"
        className="welcome-sample-offer-modal__panel relative z-[1] w-full max-w-md"
      >
        <div className="welcome-sample-offer-modal__glow" aria-hidden />
        <div className="welcome-sample-offer-modal__shine-top" aria-hidden />

        <button
          type="button"
          onClick={onDecline}
          disabled={collapsing}
          className="welcome-sample-offer-modal__close"
          aria-label={t("welcomeSampleOffer.close")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="welcome-sample-offer-modal__inner">
          <p className="welcome-sample-offer-modal__eyebrow">
            {t("welcomeSampleOffer.welcomeEyebrow")}
          </p>

          <div className="welcome-sample-offer-modal__hero">
            <div className="welcome-sample-offer-modal__icon-wrap" aria-hidden>
              <div className="welcome-sample-offer-modal__icon-halo" />
              <Image
                src={SITE_JETON_SRC}
                alt=""
                width={SITE_JETON_WIDTH}
                height={SITE_JETON_HEIGHT}
                className="welcome-sample-offer-modal__token-icon"
                sizes="120px"
                draggable={false}
                priority
              />
            </div>

            <h2
              id="welcome-sample-offer-title"
              className="welcome-sample-offer-modal__title font-display"
            >
              {t("welcomeSampleOffer.welcomeTitleLine1")}
              <br />
              {t("welcomeSampleOffer.welcomeTitleLine2")}
            </h2>
          </div>

          <div className="welcome-sample-offer-modal__offer-card">
            <p className="welcome-sample-offer-modal__offer-label">
              {t("abonnementsPage.sampleBlock.duration")}
            </p>
            <div className="welcome-sample-offer-modal__price-row">
              <span className="welcome-sample-offer-modal__price font-display">{offer.price}</span>
            </div>
          </div>

          <div className="welcome-sample-offer-modal__actions">
            <div className="welcome-sample-offer-modal__cta-wrap" onClick={() => onPurchaseStart()}>
              <CheckoutButton
                planId={offer.stripePlanId}
                planType="purchase"
                variant="primary"
                className={BTN_ABONNEMENTS_GOLD_CTA}
              >
                {t("welcomeSampleOffer.buyCta")}
              </CheckoutButton>
            </div>
            <button
              type="button"
              onClick={onDecline}
              disabled={collapsing}
              className="welcome-sample-offer-modal__decline"
            >
              {t("welcomeSampleOffer.decline")}
            </button>
            <p className="welcome-sample-offer-modal__cta-hint">{t("welcomeSampleOffer.ctaHint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
