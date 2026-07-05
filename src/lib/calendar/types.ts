export type FilmScheduleEntry = {
  id: string;
  userEmail: string;
  /** Date locale YYYY-MM-DD */
  scheduledDate: string;
  filmId?: string;
  createdAt: string;
};
