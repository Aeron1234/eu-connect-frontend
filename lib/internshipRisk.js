export function getWeeksLeft(dateEnded, now = new Date()) {
  const end = new Date(dateEnded);
  const msLeft = end.getTime() - now.getTime();
  if (msLeft <= 0) return 0;
  return msLeft / (1000 * 60 * 60 * 24 * 7);
}

export function isStudentAtRisk(student, now = new Date()) {
  const STANDARD_OJT_HOURS_PER_WEEK = 40; // BY DOLE

  const weeksLeft = getWeeksLeft(student.date_ended, now);
  const hoursNeeded = student.total_hours - student.accumulated_hours;
  const maxPossibleHours = weeksLeft * STANDARD_OJT_HOURS_PER_WEEK;
  return hoursNeeded > maxPossibleHours;
}

export function getCompletionBucket(accumulated_hours, total_hours) {
  const pct = (accumulated_hours / total_hours) * 100;
  if (pct <= 25) return "0-25%";
  if (pct <= 50) return "26-50%";
  if (pct <= 75) return "51-75%";
  return "76-100%";
}
