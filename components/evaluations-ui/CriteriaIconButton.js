"use client";

import { Loader2 } from "lucide-react";

export default function CriteriaIconButton({ children, onClick, title, danger, disabled, pending }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-foreground-subtle hover:bg-red-50 hover:text-red-600"
          : "text-foreground-subtle hover:bg-muted hover:text-primary-emphasis"
      }`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
