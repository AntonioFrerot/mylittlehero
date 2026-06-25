import { Header } from "@/components/Header";
import { FilmMetaBadges } from "@/components/films/FilmMetaBadges";
import { UserFilmHeroSpotlight } from "@/components/films/UserFilmHeroSpotlight";
import { UserFilmMedia } from "@/components/films/UserFilmMedia";
import { FilmStoryGenerationPoll } from "@/components/espace/FilmStoryGenerationPoll";
import { getFilmDisplayPosterSrc } from "@/lib/browse-catalog";
import { filmNeedsStoryPoll } from "@/lib/film-creation/story-poll";
import { resolveFilmDisplayStatus, translateFilmDisplayStatus } from "@/lib/film-creation/film-display-status";
import type { UserFilmWithStory } from "@/lib/film-creation/types";
import {
  buildUserFilmPageCopy,
  getFilmDisplayTitle,
} from "@/lib/film-creation/user-film-page";
import {
  formatFilmDurationSeconds,
  getFilmDurationSeconds,
} from "@/lib/film-creation/duration";
import { getUserFilmById } from "@/lib/film-creation/store";
import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import { getSession } from "@/lib/auth/get-session";
import { getUserLocale } from "@/lib/auth/users-store";
import { BRAND_NAME } from "@/lib/brand";
import { normalizeFilmTheme } from "@/lib/i18n/film-labels";
import { getServerTranslator } from "@/lib/i18n/server";
import { readStoryManifest, readStoryResume, readStoryTagline } from "@/lib/story-generation/manifest";
import { POSTER_DIMENSIONS } from "@/lib/hero-posters";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const session = await getSession();
  if (!session) return { title: `Film — ${BRAND_NAME}` };
  const { id } = await params;
  const film = await getUserFilmById(session.email, id);
  if (!film) return { title: `Film — ${BRAND_NAME}` };

  const userLocale = await getUserLocale(session.email);
  const { t } = await getServerTranslator();
  const manifest = await readStoryManifest(session.email, id);
  const displayTitle = getFilmDisplayTitle(
    film,
    userLocale,
    manifest?.generatedTitle
  );

  const metaTitle = displayTitle || t("space.freeTrialFilmMetaTitle");

  return {
    title: `${metaTitle} — ${BRAND_NAME}`,
  };
}

export default async function UserFilmPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?redirect=/mon-espace?section=films");
  }

  const { id } = await params;
  const film = await getUserFilmById(session.email, id);
  if (!film) notFound();

  const [resume, tagline, manifest, userLocale] = await Promise.all([
    readStoryResume(session.email, id),
    readStoryTagline(session.email, id),
    readStoryManifest(session.email, id),
    getUserLocale(session.email),
  ]);
  const { t } = await getServerTranslator();
  const pageCopy = buildUserFilmPageCopy(film, userLocale, resume, tagline);
  const displayTitle = getFilmDisplayTitle(
    film,
    userLocale,
    manifest?.generatedTitle
  );
  const isFreeTrial = isUserFreeTrialFilm(film);
  const durationSec = getFilmDurationSeconds(film);
  const durationLabel =
    durationSec != null
      ? formatFilmDurationSeconds(
          durationSec,
          userLocale === "fr" ? "fr" : "en"
        )
      : undefined;
  const badgeThemes = film.themes
    .map((theme) => normalizeFilmTheme(String(theme)))
    .filter((theme): theme is NonNullable<typeof theme> => theme != null);

  const filmWithStory: UserFilmWithStory = {
    ...film,
    ...(resume ? { storyResume: resume } : {}),
    ...(manifest?.generatedTitle
      ? { storyGeneratedTitle: manifest.generatedTitle }
      : {}),
    ...(manifest?.storyValidatedAt
      ? { storyValidatedAt: manifest.storyValidatedAt }
      : {}),
    ...(manifest?.regenerationUsed ? { storyRegenerationUsed: true } : {}),
    ...(manifest
      ? {
          storyGeneration: {
            status: manifest.status,
            ...(manifest.generationMode
              ? { mode: manifest.generationMode }
              : {}),
          },
        }
      : {}),
  };
  const displayStatus = resolveFilmDisplayStatus(filmWithStory);
  const isReady = displayStatus === "ready";
  const posterSrc = isFreeTrial
    ? undefined
    : film.posterSrc ?? (isReady ? undefined : getFilmDisplayPosterSrc(film));
  const showInCreationMedia =
    !isFreeTrial && !isReady && displayStatus === "preparing" && Boolean(pageCopy.synopsis);
  const showVideoMedia =
    !isFreeTrial && isReady && Boolean(film.posterSrc && film.videoSrc);
  const shouldPollStory = filmNeedsStoryPoll(filmWithStory);

  return (
    <>
      <FilmStoryGenerationPoll active={shouldPollStory} />
      <Header />
      <main className="min-h-screen bg-cinema-black pb-16 safe-top-offset">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <Link
            href="/mon-espace?section=films"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("space.backToFilms")}
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold-light/90">
            {isFreeTrial
              ? t("space.freeTrialFilmEyebrow")
              : translateFilmDisplayStatus(displayStatus, userLocale)}
          </p>
          {displayTitle ? (
            <h1 className="font-display mt-2 text-2xl font-bold leading-tight text-cream sm:text-3xl md:text-4xl lg:text-5xl">
              {displayTitle}
            </h1>
          ) : null}
          {pageCopy.tagline && (
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg">
              {pageCopy.tagline}
            </p>
          )}

          {badgeThemes.length > 0 && durationLabel && (
            <FilmMetaBadges
              className="mt-4"
              themes={badgeThemes}
              durationLabel={durationLabel}
              locale={userLocale}
            />
          )}

          <div className="mt-8 flex flex-col gap-6 sm:gap-8 lg:relative lg:gap-0">
            {pageCopy.synopsis ? (
              <UserFilmHeroSpotlight
                className="order-2 min-w-0 lg:order-1 lg:max-w-[calc(100%-19.5rem)] xl:max-w-[calc(100%-20.5rem)]"
                photoSrc={pageCopy.heroPhotoSrc}
                photoAlt={pageCopy.heroPhotoAlt}
                label={pageCopy.heroName}
                intro={pageCopy.intro}
                lead={pageCopy.lead}
                synopsis={pageCopy.synopsis}
              />
            ) : null}

            {posterSrc && (
              <aside className="order-1 mx-auto w-full max-w-[220px] shrink-0 sm:max-w-[260px] lg:absolute lg:bottom-0 lg:right-0 lg:order-2 lg:mx-0 lg:w-[280px] xl:w-[300px]">
                <div className="poster-card relative poster-aspect-box w-full overflow-hidden rounded-xl shadow-poster ring-1 ring-gold/30">
                  <Image
                    src={posterSrc}
                    alt={t("space.filmPosterAlt", { title: displayTitle })}
                    width={POSTER_DIMENSIONS.width}
                    height={POSTER_DIMENSIONS.height}
                    sizes="(max-width: 1024px) 280px, 300px"
                    quality={90}
                    className="object-cover object-center"
                    priority
                  />
                </div>
              </aside>
            )}
          </div>

          {showInCreationMedia || showVideoMedia ? (
            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-cinema-surface shadow-glow-gold-subtle">
              <UserFilmMedia
                posterSrc={posterSrc}
                videoPosterSrc={film.videoPosterSrc}
                videoSrc={film.videoSrc}
                title={displayTitle}
                posterAlt={t("space.filmPosterAlt", { title: displayTitle })}
                inCreationLabel={
                  showInCreationMedia
                    ? t("space.filmInCreationLabel")
                    : undefined
                }
              />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
