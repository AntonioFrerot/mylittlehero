"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { WelcomeSampleOfferModal } from "@/components/espace/WelcomeSampleOfferModal";
import { checkUserHasSitePurchase } from "@/lib/purchases/actions";
import {
  clearWelcomeSampleOfferPurchased,
  clearWelcomeSampleOfferSearchParam,
  hasWelcomeSampleOfferFromSearchParam,
  markWelcomeSampleOfferDismissed,
  markWelcomeSampleOfferPurchased,
  readWelcomeSampleOfferState,
} from "@/lib/espace/welcome-sample-offer";

type WelcomeSampleOfferPhase = "hidden" | "modal" | "collapsing" | "bubble";

type WelcomeSampleOfferContextValue = {
  bubbleVisible: boolean;
  bubbleReceiving: boolean;
  openModal: () => void;
};

const WelcomeSampleOfferContext = createContext<WelcomeSampleOfferContextValue | null>(
  null
);

export function useWelcomeSampleOffer() {
  return useContext(WelcomeSampleOfferContext);
}

type WelcomeSampleOfferProviderProps = {
  children: ReactNode;
};

export function WelcomeSampleOfferProvider({ children }: WelcomeSampleOfferProviderProps) {
  const user = useAuthUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<WelcomeSampleOfferPhase>("hidden");
  const [hasSitePurchase, setHasSitePurchase] = useState<boolean | null>(null);
  const purchaseCheckStarted = useRef(false);

  const email = user?.email ?? null;

  useEffect(() => {
    purchaseCheckStarted.current = false;
    setHasSitePurchase(null);
    setPhase("hidden");
  }, [email]);

  useEffect(() => {
    if (!email) return;

    const userEmail = email;
    let cancelled = false;

    async function hideIfPurchased(): Promise<boolean> {
      const purchased = await checkUserHasSitePurchase();
      if (cancelled) return purchased;

      setHasSitePurchase(purchased);
      if (purchased) {
        markWelcomeSampleOfferPurchased(userEmail);
        setPhase("hidden");
      }
      return purchased;
    }

    async function syncOfferState() {
      const stored = readWelcomeSampleOfferState(userEmail);
      if (stored === "purchased") {
        const purchased = await hideIfPurchased();
        if (!purchased) {
          clearWelcomeSampleOfferPurchased(userEmail);
          setPhase("bubble");
        }
        return;
      }

      if (stored === "dismissed") {
        setPhase("bubble");
        if (purchaseCheckStarted.current) return;
        purchaseCheckStarted.current = true;

        await hideIfPurchased();
        return;
      }

      if (purchaseCheckStarted.current) return;
      purchaseCheckStarted.current = true;

      const purchased = await hideIfPurchased();
      if (cancelled || purchased) return;

      setPhase("bubble");
    }

    void syncOfferState();

    return () => {
      cancelled = true;
    };
  }, [email]);

  useEffect(() => {
    if (!email || hasSitePurchase) return;

    const onMonEspaceFilms =
      pathname === "/mon-espace" &&
      (searchParams.get("section") ?? "films") === "films";

    if (onMonEspaceFilms && hasWelcomeSampleOfferFromSearchParam(searchParams)) {
      setPhase("modal");
      clearWelcomeSampleOfferSearchParam();
    }
  }, [email, hasSitePurchase, pathname, searchParams]);

  const openModal = useCallback(() => {
    if (!email) return;
    if (hasSitePurchase) {
      markWelcomeSampleOfferPurchased(email);
      setPhase("hidden");
      return;
    }

    setPhase("modal");

    if (hasSitePurchase === null && !purchaseCheckStarted.current) {
      purchaseCheckStarted.current = true;
      void checkUserHasSitePurchase().then((purchased) => {
        setHasSitePurchase(purchased);
        if (purchased) {
          markWelcomeSampleOfferPurchased(email);
          setPhase("hidden");
        }
      });
    }
  }, [email, hasSitePurchase]);

  const handleDecline = useCallback(() => {
    if (!email) return;
    setPhase((current) => (current === "collapsing" ? current : "collapsing"));
  }, [email]);

  const handleCollapseComplete = useCallback(() => {
    if (!email) return;
    markWelcomeSampleOfferDismissed(email);
    setPhase("bubble");
  }, [email]);

  useEffect(() => {
    if (!email || hasSitePurchase || phase === "hidden") return;

    let cancelled = false;

    async function recheckPurchase() {
      const purchased = await checkUserHasSitePurchase();
      if (cancelled || !purchased) return;

      markWelcomeSampleOfferPurchased(email);
      setHasSitePurchase(true);
      setPhase("hidden");
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void recheckPurchase();
      }
    };

    window.addEventListener("focus", recheckPurchase);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", recheckPurchase);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [email, hasSitePurchase, phase]);

  const bubbleVisible = Boolean(email) && phase === "bubble";
  const bubbleReceiving = Boolean(email) && phase === "collapsing";

  const value = useMemo(
    () => ({
      bubbleVisible,
      bubbleReceiving,
      openModal,
    }),
    [bubbleVisible, bubbleReceiving, openModal]
  );

  return (
    <WelcomeSampleOfferContext.Provider value={value}>
      {children}
      {email && (phase === "modal" || phase === "collapsing") ? (
        <WelcomeSampleOfferModal
          collapsing={phase === "collapsing"}
          onDecline={handleDecline}
          onCollapseComplete={handleCollapseComplete}
        />
      ) : null}
    </WelcomeSampleOfferContext.Provider>
  );
}
