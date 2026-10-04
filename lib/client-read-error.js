"use client";

import { toast } from "sonner";

/** Report a failed client read without triggering Next's console-error overlay. */
export function notifyReadError(...details) {
  const message = [...details].reverse().find((detail) => typeof detail === "string" && detail.trim());
  toast.error(message || "Could not load data. Please try again.");
}
