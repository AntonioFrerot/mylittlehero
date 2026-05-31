import Link from "next/link";
import { HashLink } from "@/components/ui/HashLink";
import {
  BTN_3D_GHOST,
  BTN_3D_PRIMARY,
  BTN_3D_PRIMARY_FLAT,
  BTN_3D_PRIMARY_FULL_GLOW,
  BTN_3D_SECONDARY,
} from "@/lib/ui/button-3d-classes";
import { type ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: BTN_3D_PRIMARY,
  secondary: BTN_3D_SECONDARY,
  ghost: BTN_3D_GHOST,
};

type ButtonGlow = "soft" | "full" | false;

function primaryClasses(glow: ButtonGlow): string {
  if (glow === false) return BTN_3D_PRIMARY_FLAT;
  if (glow === "full") return BTN_3D_PRIMARY_FULL_GLOW;
  return BTN_3D_PRIMARY;
}

type BaseProps = {
  variant?: ButtonVariant;
  /** Halo doré : léger (défaut), fort ou désactivé. */
  glow?: ButtonGlow;
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
  glow = "soft",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const resolvedClasses =
    variant === "primary" ? primaryClasses(glow) : variantClasses[variant];
  const classes = `${baseClasses} ${resolvedClasses} ${className}`;

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
