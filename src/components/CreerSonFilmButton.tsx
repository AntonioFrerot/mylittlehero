import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/get-session";
import { getServerTranslator } from "@/lib/i18n/server";
import { getCreerSonFilmHref } from "@/lib/navigation/creer-film";

type CreerSonFilmButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  glow?: "soft" | "full" | false;
  className?: string;
};

export async function CreerSonFilmButton({
  variant = "primary",
  glow = "soft",
  className = "",
}: CreerSonFilmButtonProps) {
  const [session, { t }] = await Promise.all([
    getSession(),
    getServerTranslator(),
  ]);
  const href = getCreerSonFilmHref(Boolean(session));

  return (
    <Button href={href} variant={variant} glow={glow} className={className}>
      {t("nav.createFilm")}
    </Button>
  );
}
