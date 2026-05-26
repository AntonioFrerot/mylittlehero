import { getServerTranslator } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translator";

const TRUST_POINT_KEYS = [
  { title: "home.trustPoint1Title", description: "home.trustPoint1Desc" },
  { title: "home.trustPoint2Title", description: "home.trustPoint2Desc" },
  { title: "home.trustPoint3Title", description: "home.trustPoint3Desc" },
] as const satisfies ReadonlyArray<{
  title: TranslationKey;
  description: TranslationKey;
}>;

const BADGE_KEYS = [
  "home.trustBadge1",
  "home.trustBadge2",
  "home.trustBadge3",
] as const satisfies readonly TranslationKey[];

export async function ParentTrustSection() {
  const { t } = await getServerTranslator();

  return (
    <section
      id="confiance"
      className="relative border-y border-white/5 py-16 md:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-gold/80">
              {t("home.trustEyebrow")}
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold text-cream md:text-3xl lg:text-4xl">
              {t("home.trustTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-cream/60">{t("home.trustText")}</p>

            <ul className="mt-8 flex flex-wrap gap-3">
              {BADGE_KEYS.map((key) => (
                <li
                  key={key}
                  className="rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 text-sm text-gold-light"
                >
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-4">
            {TRUST_POINT_KEYS.map((point) => (
              <li
                key={point.title}
                className="flex gap-4 rounded-2xl border border-white/5 bg-cinema-surface/80 p-5 transition-colors hover:border-gold/15 md:p-6"
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-light"
                  aria-hidden
                >
                  ✓
                </span>
                <div>
                  <h3 className="font-semibold text-cream">{t(point.title)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-cream/60 md:text-base">
                    {t(point.description)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
