import type { ReactNode } from "react";

type RequiredFieldLabelProps = {
  children: ReactNode;
  className?: string;
};

export function RequiredFieldLabel({
  children,
  className = "text-sm text-cream/70",
}: RequiredFieldLabelProps) {
  return (
    <span className={className}>
      <span className="text-gold-light" aria-hidden="true">
        *{" "}
      </span>
      {children}
    </span>
  );
}
