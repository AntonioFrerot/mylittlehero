import { Button } from "@/components/ui/Button";

type BrowseThemeCreatePanelProps = {
  gradient: string;
  themeLabel: string;
  emptyTitle: string;
  emptyHint: string;
  createHref: string;
  createLabel: string;
};

export function BrowseThemeCreatePanel({
  gradient,
  themeLabel,
  emptyTitle,
  emptyHint,
  createHref,
  createLabel,
}: BrowseThemeCreatePanelProps) {
  return (
    <div className={`browse-theme-cta ${gradient}`}>
      <div className="browse-theme-cta__inner">
        <p className="browse-theme-cta__title">{emptyTitle}</p>
        <p className="browse-theme-cta__hint">{emptyHint}</p>
        <div className="browse-theme-cta__action">
          <Button href={createHref} variant="primary" className="!text-sm">
            {createLabel}
          </Button>
        </div>
        <p className="sr-only">{themeLabel}</p>
      </div>
    </div>
  );
}
