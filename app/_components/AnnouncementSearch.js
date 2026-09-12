"use client";

import { Search } from "lucide-react";

function AnnouncementSearch({ search, setSearch }) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search announcements..."
        className="h-9 w-full rounded-full border border-stone-300 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-stone-300 focus:border-transparent"
      />
    </div>
  );
}

export default AnnouncementSearch;
