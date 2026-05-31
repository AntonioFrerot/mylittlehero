import { BrowseCatalogHeroSteps } from "@/components/browse/BrowseCatalogHeroSteps";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type BrowseCatalogHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  createHref: string;
  createLabel: string;
  examplesHref: string;
  examplesLabel: string;
  backHomeLabel: string;
  steps: Array<{ title: string; text: string }>;
  stepsTitle: string;
};

export function BrowseCatalogHero({
  eyebrow,
  title,
  lead,
  createHref,
  createLabel,
  examplesHref,
  examplesLabel,
  backHomeLabel,
  steps,
  stepsTitle,
}: BrowseCatalogHeroProps) {
  return (
    <section className="browse-hero safe-top-offset" aria-labelledby="browse-hero-title">
      <div className="browse-hero__ambient" aria-hidden>
        <div className="browse-hero__glow browse-hero__glow--gold" />
        <div className="browse-hero__glow browse-hero__glow--violet" />
      </div>

      <div className="browse-hero__shell">
        <Link href="/" className="browse-hero__back">
          {backHomeLabel}
        </Link>

        <div className="browse-hero__copy">
          <p className="browse-hero__eyebrow">{eyebrow}</p>
          <h1 id="browse-hero-title" className="browse-hero__title">
            {title}
          </h1>
          <p className="browse-hero__lead">{lead}</p>

          <div className="browse-hero__actions">
            <Button href={createHref} variant="primary" className="!px-6">
              {createLabel}
            </Button>
            <Button href={examplesHref} variant="secondary" className="!px-6">
              {examplesLabel}
            </Button>
          </div>
        </div>

        <BrowseCatalogHeroSteps stepsTitle={stepsTitle} steps={steps} />
      </div>
    </section>
  );
}
