// Shared editor section keys/hints. These keys match saved report text fields; EMPTY
// also includes memorabilia_note for new drafts without changing the section order.
export const SECTIONS = [
  { key: "organization_experience", title: "Working in the organization / company", hint: "Describe the company, your role, the people you worked with, and what you learned about the workplace." },
  { key: "work_schedule", title: "Work schedule", hint: "Explain your usual workdays, hours, and responsibilities." },
  { key: "memorable_moment", title: "Most memorable practicum moment", hint: "Share one meaningful experience and why it stayed with you." },
  { key: "difficulties_solutions", title: "Difficulties and solutions", hint: "Describe challenges you faced, how you handled them, and what you learned." },
];

export const EMPTY = Object.fromEntries([...SECTIONS.map(({ key }) => [key, ""]), ["memorabilia_note", ""]]);

export const fieldClass = "mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary-emphasis focus:ring-2 focus:ring-primary/20";

export const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted";

export const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";
