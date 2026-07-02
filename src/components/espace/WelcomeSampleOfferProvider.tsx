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

    async function syncOfferState() {
      const stored = readWelcomeSampleOfferState(userEmail);
      if (stored === "purchased") {
        setHasSitePurchase(true);
        setPhase("hidden");
        return;
      }

      if (stored === "dismissed") {
        setPhase("bubble");
        if (purchaseCheckStarted.current) return;
        purchaseCheckStarted.current = true;

        const purchased = await checkUserHasSitePurchase();
        if (cancelled) return;

        setHasSitePurchase(purchased);
        if (purchased) {
          markWelcomeSampleOfferPurchased(userEmail);
          setPhase("hidden");
        }
        return;
      }

      if (purchaseCheckStarted.current) return;
      purchaseCheckStarted.current = true;

      const purchased = await checkUserHasSitePurchase();
      if (cancelled) return;

      setHasSitePurchase(purchased);

      if (purchased) {
        markWelcomeSampleOfferPurchased(userEmail);
        setPhase("hidden");
        return;
      }

      setPhase("bubble");
    }

    void syncOfferState();

    return () => {
      cancelled = true;
    };
  }, [email]);

  useEffect(() => {
    if (!email || hasSitePurchase) return;
    if (readWelcomeSampleOfferState(email) === "purchased") return;

    const onMonEspaceFilms =
      pathname === "/mon-espace" &&
      (searchParams.get("section") ?? "films") === "films";

    if (onMonEspaceFilms && hasWelcomeSampleOfferFromSearchParam(searchParams)) {
      setPhase("modal");
      clearWelcomeSampleOfferSearchParam();
    }
  }, [email, hasSitePurchase, pathname, searchParams]);

  const openModal = useCallback(() => {
    if (!email || readWelcomeSampleOfferState(email) === "purchased") return;
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

  const handlePurchaseStart = useCallback(() => {
    if (!email) return;
    markWelcomeSampleOfferPurchased(email);
    setHasSitePurchase(true);
    setPhase("hidden");
  }, [email]);

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
          onPurchaseStart={handlePurchaseStart}
        />
      ) : null}
    </WelcomeSampleOfferContext.Provider>
  );
}
