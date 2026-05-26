import { Button } from "@/components/ui/Button";
import { getServerTranslator } from "@/lib/i18n/server";

export async function FreeTrialBanner() {
  const { t } = await getServerTranslator();

  return (
    <div className="flex justify-center">
      <Button
        href="/connexion?redirect=%2Fcreer-film"
        variant="primary"
        className="!text-sm md:!text-base"
      >
        {t("pricing.freeTrial")}
      </Button>
    </div>
  );
}
