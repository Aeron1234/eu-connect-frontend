"use client";

import { CalendarDays, ClipboardList, Megaphone, BriefcaseBusiness } from "lucide-react";

// Calendar entry display metadata and the empty month shape. Kind IDs match query result
// collections; role/ownership rules are applied by the board and backend, not these labels.
export const kinds = [
  { id: "announcement", label: "Announcements", dot: "bg-primary", chip: "border-primary/25 bg-primary/10 text-primary-emphasis", icon: Megaphone },
  { id: "schedule", label: "Schedules", dot: "bg-emerald-500", chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", icon: CalendarDays },
  { id: "internship", label: "Internship", dot: "bg-sky-500", chip: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300", icon: BriefcaseBusiness },
  { id: "todo", label: "My to-dos", dot: "bg-amber-500", chip: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: ClipboardList },
];

export const blank = { announcements: [], schedules: [], internship: null, todos: [] };

export const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
