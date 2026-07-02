"use client";

import Image from "next/image";
import { useWelcomeSampleOffer } from "@/components/espace/WelcomeSampleOfferProvider";
import { useLocale } from "@/components/LocaleProvider";
import { SITE_JETON_HEIGHT, SITE_JETON_SRC, SITE_JETON_WIDTH } from "@/lib/brand";

export function WelcomeSampleOfferBubble() {
  const welcomeSampleOffer = useWelcomeSampleOffer();
  const { t } = useLocale();

  if (!welcomeSampleOffer?.bubbleVisible && !welcomeSampleOffer?.bubbleReceiving) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={welcomeSampleOffer.openModal}
      className={`welcome-sample-offer-bubble active:scale-95 transition-transform${
        welcomeSampleOffer.bubbleReceiving ? " welcome-sample-offer-bubble--receiving" : ""
      }`}
      aria-label={t("welcomeSampleOffer.bubbleLabel")}
      title={t("welcomeSampleOffer.bubbleLabel")}
      tabIndex={welcomeSampleOffer.bubbleReceiving ? -1 : undefined}
      aria-hidden={welcomeSampleOffer.bubbleReceiving ? true : undefined}
    >
      <span className="welcome-sample-offer-bubble__shell" aria-hidden>
        <span className="welcome-sample-offer-bubble__shine welcome-sample-offer-bubble__shine--main" />
        <span className="welcome-sample-offer-bubble__shine welcome-sample-offer-bubble__shine--soft" />
      </span>
      <Image
        src={SITE_JETON_SRC}
        alt=""
        width={SITE_JETON_WIDTH}
        height={SITE_JETON_HEIGHT}
        className="welcome-sample-offer-bubble__icon"
        sizes="44px"
        draggable={false}
      />
    </button>
  );
}
