const DAY_MS = 86400000;
export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

// Date inputs are calendar dates, not device-local instants. UTC arithmetic
// prevents timezone/DST changes from shifting a selected weekday.
export function weekdaysForDateRange(from, until) {
  const parse = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
  };
  const start = parse(from), end = parse(until);
  if (start === null || end === null || end < start) return null;
  const length = Math.round((end - start) / DAY_MS) + 1;
  if (length >= 7) return [...ALL_WEEKDAYS];
  return Array.from({ length }, (_, index) => new Date(start + index * DAY_MS).getUTCDay()).sort((a, b) => a - b);
}

// Preserve deliberate rest-day choices when reopening a saved schedule, while
// removing weekdays that never occur inside a bounded range.
export function initialScheduleWeekdays(schedule) {
  const covered = weekdaysForDateRange(schedule?.startDate, schedule?.endDate);
  const saved = schedule?.workingDays;
  return Array.isArray(saved) ? saved.filter(day => !covered || covered.includes(day)) : covered || [...ALL_WEEKDAYS];
}
