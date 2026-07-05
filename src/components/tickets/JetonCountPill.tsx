import { GoldenJeton } from "@/components/tickets/GoldenJeton";

type JetonCountPillProps = {
  count: number;
  size?: "sm" | "md" | "onPrimary";
  className?: string;
  label?: string;
};

const SIZE_MAP = {
  sm: "pill",
  md: "pill",
  onPrimary: "button",
} as const;

export function JetonCountPill({
  count,
  size = "md",
  className = "",
  label,
}: JetonCountPillProps) {
  const sizeClass = SIZE_MAP[size];
  const variantClass = size === "onPrimary" ? "gold-jeton--on-dark" : "";

  return (
    <GoldenJeton
      count={count}
      size={sizeClass}
      label={label}
      className={`${variantClass} ${className}`.trim()}
    />
  );
}
