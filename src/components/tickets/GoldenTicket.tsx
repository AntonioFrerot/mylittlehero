import Image from "next/image";
import { SITE_TICKET_SRC } from "@/lib/brand";

type GoldenTicketSize = "header" | "pill" | "card" | "button";

type GoldenTicketProps = {
  count: number;
  size?: GoldenTicketSize;
  className?: string;
  /** Remplace le chiffre seul (ex. « 1 ticket »). */
  label?: string;
};

const SIZE_CLASS: Record<GoldenTicketSize, string> = {
  header: "gold-ticket--header",
  pill: "gold-ticket--pill",
  card: "gold-ticket--card",
  button: "gold-ticket--button",
};

export function GoldenTicket({
  count,
  size = "pill",
  className = "",
  label,
}: GoldenTicketProps) {
  return (
    <span
      className={`gold-ticket gold-ticket--asset ${SIZE_CLASS[size]} ${className}`}
      aria-hidden={size === "button"}
    >
      <span className="gold-ticket__icon">
        <Image
          src={SITE_TICKET_SRC}
          alt=""
          width={160}
          height={64}
          className="gold-ticket__img"
          unoptimized
        />
      </span>
      <span className="gold-ticket__value">{label ?? count}</span>
    </span>
  );
}
