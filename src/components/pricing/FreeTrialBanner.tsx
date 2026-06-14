import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/get-session";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { getServerTranslator } from "@/lib/i18n/server";

export async function FreeTrialBanner() {
  const session = await getSession();

  if (session) {
    const freeFilmAvailable = await isFreeFilmAvailableForEmail(session.email);
    if (!freeFilmAvailable) return null;
  }

  const { t } = await getServerTranslator();
  const href = session ? "/creer-film" : "/connexion?redirect=%2Fcreer-film";

  return (
    <div className="flex justify-center">
      <Button href={href} variant="primary" className="!text-sm md:!text-base">
        {t("pricing.freeTrial")}
      </Button>
    </div>
  );
}
