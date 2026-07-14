import Link from "next/link";
import {
  BTN_3D_PRIMARY_ACTION,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";

type FilmCreationNoCreditsNoticeProps = {
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
};

export function FilmCreationNoCreditsNotice({
  eyebrow,
  title,
  lead,
  cta,
}: FilmCreationNoCreditsNoticeProps) {
  return (
    <section
      className={`film-creation-no-credits ${SURFACE_3D_PANEL_LG} mt-6 p-4 sm:mt-8 sm:p-6`}
      aria-labelledby="film-creation-no-credits-title"
    >
      <p className="film-creation-no-credits__eyebrow">{eyebrow}</p>
      <h2
        id="film-creation-no-credits-title"
        className="film-creation-no-credits__title"
      >
        {title}
      </h2>
      <p className="film-creation-no-credits__lead">{lead}</p>
      <Link href="/abonnements" className={`film-creation-no-credits__cta ${BTN_3D_PRIMARY_ACTION}`}>
        {cta}
      </Link>
    </section>
  );
}
