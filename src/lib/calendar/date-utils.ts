/** Clé jour locale YYYY-MM-DD (sans décalage UTC). */
export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayDayKey(): string {
  return toDayKey(new Date());
}

export function isPastDayKey(key: string): boolean {
  return key < todayDayKey();
}

export function isTodayKey(key: string): boolean {
  return key === todayDayKey();
}

/** Grille calendrier (lundi = première colonne). */
export function getCalendarGrid(year: number, month: number): (string | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDayKey(new Date(year, month, day)));
  }
  return cells;
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function addPeriodToDayKey(
  dayKey: string,
  period: "month" | "week",
  count: number
): string {
  const date = parseDayKey(dayKey);
  if (period === "month") {
    return toDayKey(
      new Date(date.getFullYear(), date.getMonth() + count, date.getDate())
    );
  }
  return toDayKey(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + count * 7)
  );
}
