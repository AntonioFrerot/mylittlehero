"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  CREER_FILM_CONNEXION_REDIRECT,
} from "@/lib/navigation/creer-film";
import { SURFACE_3D_ICON_LG, SURFACE_3D_STEP_CARD } from "@/lib/ui/button-3d-classes";
import type { TranslationKey } from "@/lib/i18n/translator";

const STEPS = [1, 2, 3] as const;

const STEP_KEYS: Record<
  (typeof STEPS)[number],
  { title: TranslationKey; description: TranslationKey; cta?: TranslationKey }
> = {
  1: {
    title: "home.howStep1Title",
    description: "home.howStep1Desc",
    cta: "home.howStep1Cta",
  },
  2: {
    title: "home.howStep2Title",
    description: "home.howStep2Desc",
    cta: "home.howStep2Cta",
  },
  3: {
    title: "home.howStep3Title",
    description: "home.howStep3Desc",
  },
};

function StepIcon({ step }: { step: number }) {
  const paths: Record<number, ReactNode> = {
    1: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
    2: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    ),
    3: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <svg
      className="block h-6 w-6 shrink-0 text-gold-light"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      {paths[step]}
    </svg>
  );
}

function getStepHref(
  step: number,
  isLoggedIn: boolean,
  createFilmHref: string
): string | undefined {
  if (step === 1) {
    return isLoggedIn ? undefined : CREER_FILM_CONNEXION_REDIRECT;
  }
  if (step === 2) {
    return isLoggedIn ? createFilmHref : CREER_FILM_CONNEXION_REDIRECT;
  }
  return undefined;
}

function StepCard({
  step,
  href,
}: {
  step: (typeof STEPS)[number];
  href?: string;
}) {
  const { t } = useLocale();
  const keys = STEP_KEYS[step];

  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className={`${SURFACE_3D_ICON_LG} shrink-0`} aria-hidden>
          <StepIcon step={step} />
        </span>
        <span className="font-display text-4xl font-bold text-gold/20">
          {step}
        </span>
      </div>
      <h3 className="font-display mt-6 text-xl font-semibold text-cream group-hover:text-gold-light">
        {t(keys.title)}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-cream/60 md:text-base">
        {t(keys.description)}
      </p>
      {href && keys.cta && (
        <p className="mt-4 text-sm font-medium text-gold-light/90 group-hover:text-gold-light">
          {t(keys.cta)}
        </p>
      )}
    </>
  );

  const className = `${SURFACE_3D_STEP_CARD} cursor-pointer`;

  if (href) {
    return (
      <Link href={href} className={`${className} cursor-pointer`}>
        {content}
      </Link>
    );
  }

  return <li className={className}>{content}</li>;
}

type HowItWorksStepListProps = {
  createFilmHref: string;
};

export function HowItWorksStepList({ createFilmHref }: HowItWorksStepListProps) {
  const user = useAuthUser();
  const isLoggedIn = !!user;

  return (
    <ol className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
      {STEPS.map((step) => {
        const href = getStepHref(step, isLoggedIn, createFilmHref);

        if (href) {
          return (
            <li key={step}>
              <StepCard step={step} href={href} />
            </li>
          );
        }

        return <StepCard key={step} step={step} />;
      })}
    </ol>
  );
}
