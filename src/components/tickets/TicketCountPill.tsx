import { GoldenTicket } from "@/components/tickets/GoldenTicket";

type TicketCountPillProps = {
  count: number;
  size?: "sm" | "md" | "lg" | "onPrimary";
  className?: string;
  label?: string;
};

const SIZE_MAP = {
  sm: "pill",
  md: "card",
  lg: "card",
  onPrimary: "button",
} as const;

export function TicketCountPill({
  count,
  size = "md",
  className = "",
  label,
}: TicketCountPillProps) {
  const sizeClass = SIZE_MAP[size];
  const variantClass = size === "onPrimary" ? "gold-ticket--on-dark" : "";

  return (
    <GoldenTicket
      count={count}
      size={sizeClass}
      label={label}
      className={`${variantClass} ${className}`.trim()}
    />
  );
}
