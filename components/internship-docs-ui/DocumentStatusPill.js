"use client";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
};

export default function DocumentStatusPill({ status }) {
  if (!status) {
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700">
        Submitted
      </span>
    );
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[status] || "bg-muted text-foreground-soft"}`}
    >
      {status}
    </span>
  );
}
