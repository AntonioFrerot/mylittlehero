import Image from "next/image";
import { SITE_JETON_HEIGHT, SITE_JETON_SRC, SITE_JETON_WIDTH } from "@/lib/brand";

type GoldenJetonSize = "header" | "pill" | "button";

type GoldenJetonProps = {
  count: number;
  size?: GoldenJetonSize;
  className?: string;
  label?: string;
};

const SIZE_CLASS: Record<GoldenJetonSize, string> = {
  header: "gold-jeton--header",
  pill: "gold-jeton--pill",
  button: "gold-jeton--button",
};

export function GoldenJeton({
  count,
  size = "pill",
  className = "",
  label,
}: GoldenJetonProps) {
  return (
    <span
      className={`gold-jeton gold-jeton--asset ${SIZE_CLASS[size]} ${className}`}
      aria-hidden={size === "pill"}
    >
      <span className="gold-jeton__icon">
        <Image
          src={SITE_JETON_SRC}
          alt=""
          width={SITE_JETON_WIDTH}
          height={SITE_JETON_HEIGHT}
          className="gold-jeton__img"
          sizes="56px"
        />
      </span>
      <span className="gold-jeton__value">{label ?? count}</span>
    </span>
  );
}
