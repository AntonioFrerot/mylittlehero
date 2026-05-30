import { HowItWorksStepList } from "@/components/HowItWorksStepList";
import { getServerTranslator } from "@/lib/i18n/server";

export async function HowItWorks() {
  const { t } = await getServerTranslator();

  return (
    <section
      id="comment-ca-marche"
      className="relative border-b border-white/5 bg-cinema-surface/50 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gold/80">
            {t("home.howEyebrow")}
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold text-cream md:text-3xl lg:text-4xl">
            {t("home.howTitle")}
          </h2>
          <p className="mt-4 text-cream/60">{t("home.howSubtitle")}</p>
        </div>

        <HowItWorksStepList />
      </div>
    </section>
  );
}
