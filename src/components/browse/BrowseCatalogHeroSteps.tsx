"use client";

import { useState } from "react";

type BrowseCatalogHeroStepsProps = {
  stepsTitle: string;
  steps: Array<{ title: string; text: string }>;
};

function StepsChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`browse-hero__steps-chevron${open ? " browse-hero__steps-chevron--open" : ""}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function BrowseCatalogHeroSteps({ stepsTitle, steps }: BrowseCatalogHeroStepsProps) {
  const [open, setOpen] = useState(false);
  const panelId = "browse-hero-steps-panel";

  return (
    <div className="browse-hero__steps">
      <button
        type="button"
        className="browse-hero__steps-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="browse-hero__steps-toggle-copy">
          <span className="browse-hero__steps-title">{stepsTitle}</span>
        </span>

        <span className="browse-hero__steps-toggle-action">
          <StepsChevron open={open} />
        </span>
      </button>

      <p className="browse-hero__steps-title browse-hero__steps-title--desktop">{stepsTitle}</p>

      <ol
        id={panelId}
        className={`browse-hero__steps-list${open ? " browse-hero__steps-list--open" : ""}`}
      >
        {steps.map((step, index) => (
          <li key={step.title} className="browse-hero__step">
            <span className="browse-hero__step-index">{index + 1}</span>
            <div>
              <p className="browse-hero__step-title">{step.title}</p>
              <p className="browse-hero__step-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
