// Map-card presentation only: two initials from name words, with no change to site identity.
export function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Use abbreviated month/year labels for compact internship cards; no end date means Present.
export function formatPeriod(dateStarted, dateEnded) {
  const start = dateStarted
    ? new Date(dateStarted).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";
  const end = dateEnded
    ? new Date(dateEnded).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Present";
  return `${start} – ${end}`;
}
