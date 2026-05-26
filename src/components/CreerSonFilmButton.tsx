import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/get-session";
import { getServerTranslator } from "@/lib/i18n/server";
import { getCreerSonFilmHref } from "@/lib/navigation/creer-film";

type CreerSonFilmButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export async function CreerSonFilmButton({
  variant = "primary",
  className = "",
}: CreerSonFilmButtonProps) {
  const session = await getSession();
  const href = getCreerSonFilmHref(!!session);
  const { t } = await getServerTranslator();

  return (
    <Button href={href} variant={variant} className={className}>
      {t("nav.createFilm")}
    </Button>
  );
}
