"use client";

import { LayoutGrid, ListIcon, Search } from "lucide-react";
import DropdownFilter from "../ui/DropdownFilter";

const categoryOptions = [
  { value: "all", label: "All Documents" },
  { value: "before", label: "Before Deployment" },
  { value: "after", label: "After Deployment" },
];

export default function DocumentsToolbar({ query, setQuery, filter, setFilter, view, setView }) {
  return (
    <div className="mt-5 flex justify-start">
      <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto">
        <div className="relative col-span-2 min-w-0 sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="h-9 w-full pl-9 pr-3 rounded-lg bg-card border border-border focus:border-primary/40 focus:outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
        <DropdownFilter
          value={filter}
          onValueChange={setFilter}
          options={categoryOptions}
          placeholder="Document category"
          className="h-9 w-full min-w-0 rounded-md bg-card p-2 text-xs sm:w-[200px]"
        />
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0 bg-card">
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={`p-2 transition-colors ${view === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            className={`p-2 transition-colors ${view === "list" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
