import type { ExampleFilmAudioLocale } from "@/lib/example-film-audio-locale";
import { filmLanguagePosterBadgeClassName } from "@/lib/film-meta-badges";

type ExampleFilmLanguageFlagProps = {
  locale: ExampleFilmAudioLocale;
  label: string;
};

function FlagFranceSvg() {
  return (
    <svg
      viewBox="0 0 3 2"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="1" height="2" x="0" fill="#002395" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#ED2939" />
    </svg>
  );
}

function FlagEnglishSvg() {
  return (
    <svg
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0 V30 M0 15 H60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export function ExampleFilmLanguageFlag({
  locale,
  label,
}: ExampleFilmLanguageFlagProps) {
  return (
    <span
      className={filmLanguagePosterBadgeClassName()}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className="example-film-lang-flag__graphic" aria-hidden>
        {locale === "fr" ? <FlagFranceSvg /> : <FlagEnglishSvg />}
      </span>
    </span>
  );
}