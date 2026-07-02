"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  const email = user?.email ?? null;

  useEffect(() => {
    let cancelled = false;

    async function syncOfferState() {
      if (!email) {
        setPhase("hidden");
        return;
      }

      const stored = readWelcomeSampleOfferState(email);
      if (stored === "purchased") {
        setPhase("hidden");
        return;
      }

      const hasSitePurchase = await checkUserHasSitePurchase();
      if (cancelled) return;

      if (hasSitePurchase) {
        markWelcomeSampleOfferPurchased(email);
        setPhase("hidden");
        return;
      }

      if (stored === "dismissed") {
        setPhase("bubble");
        return;
      }

      const onMonEspaceFilms =
        pathname === "/mon-espace" &&
        (searchParams.get("section") ?? "films") === "films";

      if (onMonEspaceFilms && hasWelcomeSampleOfferFromSearchParam(searchParams)) {
        setPhase("modal");
        clearWelcomeSampleOfferSearchParam();
        return;
      }

      setPhase("bubble");
    }

    void syncOfferState();

    return () => {
      cancelled = true;
    };
  }, [email, pathname, searchParams]);

  const openModal = useCallback(() => {
    if (!email || readWelcomeSampleOfferState(email) === "purchased") return;
    void checkUserHasSitePurchase().then((hasSitePurchase) => {
      if (hasSitePurchase) {
        markWelcomeSampleOfferPurchased(email);
        setPhase("hidden");
        return;
      }
      setPhase("modal");
    });
  }, [email]);

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
