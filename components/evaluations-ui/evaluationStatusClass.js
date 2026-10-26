// Legacy status badge colors for display labels; this helper does not define posting state
// or restore the retired confirmation/dispute workflow. Unknown labels use the blue fallback.
export const evaluationStatusClass = (status) =>
    status === "Completed" || status === "Submitted"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Pending"
        ? "bg-amber-100 text-amber-700"
        : status === "Disputed"
          ? "bg-muted text-foreground"
          : "bg-blue-100 text-blue-700";
