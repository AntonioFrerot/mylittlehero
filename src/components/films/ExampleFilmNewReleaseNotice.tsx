type ExampleFilmNewReleaseNoticeProps = {
  badgeLabel: string;
  headline: string;
  message: string;
};

export function ExampleFilmNewReleaseNotice({
  badgeLabel,
  headline,
  message,
}: ExampleFilmNewReleaseNoticeProps) {
  return (
    <aside
      className="example-film-new-notice mt-8"
      aria-labelledby="example-film-new-notice-headline"
    >
      <p className="example-film-new-notice__badge">{badgeLabel}</p>
      <div className="example-film-new-notice__body">
        <h2 id="example-film-new-notice-headline" className="example-film-new-notice__headline">
          {headline}
        </h2>
        <p className="example-film-new-notice__text">{message}</p>
      </div>
    </aside>
  );
}