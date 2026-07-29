"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function AnnouncementSearch({ filteredByCategory, search }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState(search || "");

  function handleSearch(term) {
    const params = new URLSearchParams(searchParams);

    // When searching, always reset to page 1
    params.set("category", filteredByCategory);

    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    // Push the new URL without refreshing the page
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSubmit(e) {
    e.preventDefault();

    handleSearch(searchValue);
  }

  function handleClear() {
    setSearchValue("");
    handleSearch("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex-1 flex items-center bg-white border border-stone-300 min-h-8 max-w-70 px-2 py-1 rounded-sm ${isFocused ? "ring-2 ring-stone-300" : ""}`}
    >
      <label htmlFor="search-announcement" className="text-stone-500">
        <Search className="h-5 w-5" />
      </label>
      <input
        type="text"
        id="search-announcement"
        className="flex-1 px-1 outline-none"
        placeholder="Search announcements..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {searchValue && (
        <div className="text-stone-500" onClick={handleClear}>
          <X className="h-4 w-4" />
        </div>
      )}
    </form>
  );
}

export default AnnouncementSearch;
