export const evaluationStatusClass = (status) =>
    status === "Completed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Pending"
        ? "bg-amber-100 text-amber-700"
        : status === "Disputed"
          ? "bg-muted text-foreground"
          : "bg-blue-100 text-blue-700";
