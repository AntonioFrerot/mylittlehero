type ExampleFilmComingSoonOverlayProps = {
  label: string;
};

export function ExampleFilmComingSoonOverlay({
  label,
}: ExampleFilmComingSoonOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4"
      aria-live="polite"
    >
      <div className="example-film-coming-soon">
        <span className="example-film-coming-soon__glow" aria-hidden />
        <p className="example-film-coming-soon__label">{label}</p>
      </div>
    </div>
  );
}
