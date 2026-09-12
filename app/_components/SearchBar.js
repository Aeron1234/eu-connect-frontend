"use client";
import { Search } from "lucide-react";

function SearchBar({
  onChange = null,
  value = "",
  placeholder = "",
  defaultValue = "",
  ariaLabel = "",
  position = "left",
}) {
  return (
    <div
      className={`relative flex-1 sm:flex-none ${position === "left" ? "ml-auto" : ""}`}
    >
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="h-10 w-full md:w-64 pl-9 pr-4 rounded-md bg-white border border-stone-200 focus:border-primary-500/40 focus:outline-none text-sm placeholder:text-stone-400"
      />
    </div>
  );
}

export default SearchBar;
