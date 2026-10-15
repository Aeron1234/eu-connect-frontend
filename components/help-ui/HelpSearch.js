import { BookOpen, Search, X } from "lucide-react";
import { roleNames } from "./helpContent";

export default function HelpSearch({ role, query, setQuery }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary-emphasis">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        {roleNames[role] ?? "User"} guide
      </div>
      <p className="mt-2 text-sm text-foreground-soft">Search a task, then open a guide for steps and a link to the right page.</p>
      <div className="relative mt-4 max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-soft" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search help, e.g. clock in or evaluations"
          aria-label="Search help guides"
          className="w-full rounded-lg border border-border bg-canvas py-2.5 pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-foreground-soft focus:border-primary-emphasis focus:ring-2 focus:ring-primary-emphasis/20"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-soft hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
