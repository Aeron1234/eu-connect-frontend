"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

function SearchExistingAccount({ search, setSearch, setQuery }) {
  const [onFocus, setOnFocus] = useState(false);

  function handleSearch(e) {
    e.preventDefault();

    if (!search.trim()) return;

    setQuery(search.toLowerCase());
  }

  function handleClear() {
    setQuery("");
    setSearch("");
  }

  return (
    <div
      className={`text-sm flex h-fit items-center p-1 gap-1 rounded-sm border bg-stone-100 border-stone-300 ${onFocus ? "focus-within:ring-2 focus-within:ring-stone-300 focus-within:border-transparent" : ""} `}
    >
      <form className="h-full flex items-center" onSubmit={handleSearch}>
        <label className="flex items-center gap-1">
          <span>
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search account..."
            className="outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOnFocus(true)}
            onBlur={() => setOnFocus(false)}
            required
          />
        </label>
      </form>

      {search.trim() && (
        <div className="text-stone-500" onClick={handleClear}>
          <X className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export default SearchExistingAccount;
