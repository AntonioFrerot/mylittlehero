type TarifsPerFilmRowProps = {
  label: string;
  centered?: boolean;
  position?: "above" | "below";
};

export function TarifsPerFilmRow({
  label,
  centered = false,
  position = "above",
}: TarifsPerFilmRowProps) {
  return (
    <div
      className={`tarifs-plan-card__per-film-row${
        centered ? " tarifs-plan-card__per-film-row--centered" : ""
      }${position === "below" ? " tarifs-plan-card__per-film-row--below" : ""}`}
    >
      <span className="tarifs-plan-card__per-film">{label}</span>
    </div>
  );
}
