import Link from "next/link";
import { HashLink } from "@/components/ui/HashLink";
import { type ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-cinema-black font-semibold shadow-glow-gold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "border border-gold/40 bg-white/5 text-cream backdrop-blur-sm hover:border-gold/70 hover:bg-white/10",
  ghost: "text-cream/80 hover:text-gold-light",
};

type BaseProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = BaseProps &
  ComponentPropsWithoutRef<typeof Link> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition-all duration-300 active:scale-[0.98] md:min-h-0 md:px-8 md:py-3.5 md:text-base";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    const LinkComponent = href.includes("#") ? HashLink : Link;
    return (
      <LinkComponent href={href} className={classes} {...linkProps}>
        {children}
      </LinkComponent>
    );
  }

  return (
    <button type="button" className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
