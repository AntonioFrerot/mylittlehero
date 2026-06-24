import { FreeTrialIntentLink } from "@/components/film-creation/FreeTrialIntentLink";
import { getSession } from "@/lib/auth/get-session";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { buildCreerFilmFreeTrialHref } from "@/lib/film-creation/free-trial-intent";
import { getServerTranslator } from "@/lib/i18n/server";

export async function FreeTrialBanner() {
  const session = await getSession();

  if (session) {
    const freeFilmAvailable = await isFreeFilmAvailableForEmail(session.email);
    if (!freeFilmAvailable) return null;
  }

  const { t } = await getServerTranslator();
  const href = buildCreerFilmFreeTrialHref(Boolean(session));

  return (
    <div className="flex justify-center">
      <FreeTrialIntentLink href={href} className="!text-sm md:!text-base">
        {t("pricing.freeTrial")}
      </FreeTrialIntentLink>
    </div>
  );
}
