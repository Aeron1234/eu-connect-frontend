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
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="h-10 w-full md:w-64 pl-9 pr-4 rounded-md bg-card border border-border focus:border-primary/40 focus:outline-none text-sm placeholder:text-foreground-subtle"
      />
    </div>
  );
}

export default SearchBar;
