import type { TarifsPlanFeatureId } from "@/lib/i18n/tarifs-catalog";

type TarifsPlanFeatureItem = {
  id: TarifsPlanFeatureId;
  label: string;
  included: boolean;
};

type TarifsPlanFeatureListProps = {
  features: TarifsPlanFeatureItem[];
};

function FeatureCheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="tarifs-plan-feature__icon-svg"
      width="14"
      height="14"
      aria-hidden
    >
      <path
        d="M6.5 12.5 10 16l7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureCrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="tarifs-plan-feature__icon-svg"
      width="14"
      height="14"
      aria-hidden
    >
      <path
        d="M8 8l8 8M16 8l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TarifsPlanFeatureList({ features }: TarifsPlanFeatureListProps) {
  return (
    <ul className="tarifs-plan-feature-list tarifs-plan-card__features">
      {features.map((feature) => {
        const isIncluded = feature.included;

        return (
          <li
            key={feature.id}
            className={`tarifs-plan-feature ${
              isIncluded ? "tarifs-plan-feature--included" : "tarifs-plan-feature--excluded"
            }`}
          >
            <span className="tarifs-plan-feature__mark" aria-hidden>
              {isIncluded ? <FeatureCheckIcon /> : <FeatureCrossIcon />}
            </span>
            <span className="tarifs-plan-feature__label">{feature.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
