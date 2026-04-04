"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

function StorageSearchFile({ search, setSearch, setQuery }) {
  const [isFocused, setIsFocused] = useState(false);

  function handleSearch(e) {
    e.preventDefault();

    if (search.trim() === "") {
      setQuery("");
      return;
    }

    setQuery(search.trim());
  }

  function handleClear() {
    setSearch("");
    setQuery("");
  }

  return (
    <div
      className={`flex-1 border border-stone-300 bg-white rounded-sm flex items-center self-end px-2 gap-2  ${isFocused ? "ring-2 ring-stone-300" : ""} `}
    >
      <form onSubmit={handleSearch} className="">
        <label className="flex gap-1 items-center ">
          <span className="text-stone-600">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search file name..."
            className="py-1.5 outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </label>
      </form>
      {search.trim() && (
        <button className="text-stone-400 cursor-pointer" onClick={handleClear}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default StorageSearchFile;
