import { Button } from "@/components/ui/Button";
import { getServerTranslator } from "@/lib/i18n/server";
import { resolveCreerSonFilmHref } from "@/lib/navigation/creer-film.server";

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
  const href = await resolveCreerSonFilmHref();
  const { t } = await getServerTranslator();

  return (
    <Button href={href} variant={variant} glow={glow} className={className}>
      {t("nav.createFilm")}
    </Button>
  );
}
