"use client";

const STATUS_STYLES = {
  finished: "bg-green-50 text-green-700",
  ongoing: "bg-amber-50 text-amber-700",
  withdrawn: "bg-muted text-foreground-soft",
};

export default function PastInternshipStatusPill({ status }) {
  const key = (status || "").toLowerCase();
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[key] || STATUS_STYLES.withdrawn}`}
    >
      {status}
    </span>
  );
}
