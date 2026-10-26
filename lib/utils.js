import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Compose conditional class values, then resolve conflicting Tailwind utilities.
// Use cn for component overrides; cx below only joins truthy strings without conflict merging.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Presentation metadata for document badges. MIME labels and colors are display hints;
// they do not validate a file's actual contents or authorize preview/download access.
export const TYPE_TONES = {
  PDF: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  DOC: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DOCX: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  XLS: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  XLSX: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CSV: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  TXT: "bg-muted text-foreground-soft dark:bg-stone-800 dark:text-foreground-faint",
  JPG: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  PNG: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  WEBP: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export const FILE_TYPE_LABELS = {
  "application/pdf": "PDF",
  "text/plain": "TXT",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/csv": "CSV",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
};

export const typeTone = (label) =>
  TYPE_TONES[label] ||
  "bg-muted text-foreground-soft dark:bg-stone-800 dark:text-foreground-faint";

// Prefer known MIME labels, then an uppercase subtype, then FILE for a missing type.
export function getFileTypeLabel(mimeType = "") {
  return (
    FILE_TYPE_LABELS[mimeType] ||
    mimeType.split("/")[1]?.toUpperCase() ||
    "FILE"
  );
}
