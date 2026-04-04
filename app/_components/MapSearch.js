"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function MapSearch({ setQuery, search, setSearch }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function handleSubmit(e) {
    e.preventDefault();
    if (!search.trim()) {
      setQuery("");

      return;
    }

    const params = new URLSearchParams(searchParams);

    if (searchParams.get("filter") !== "all") {
      params.set("filter", "all");
    }

    setQuery(search.trim().toLocaleLowerCase());

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams);

    if (searchParams.get("filter") !== "all") {
      params.set("filter", "all");
    }

    setSearch("");
    setQuery("");

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-87 bg-white border rounded-sm flex items-center gap-1 self-start justify-self-center px-2"
    >
      <label htmlFor="search-location">
        <Search size={20} />
      </label>
      <input
        id="search-location"
        type="text"
        name="search"
        placeholder="Student name, course, or company..."
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        className="outline-none p-2 w-full"
      />

      {search.trim() && (
        <div className="text-stone-500" onClick={handleClear}>
          <span>
            <X className="h4 w-4" />
          </span>
        </div>
      )}
    </form>
  );
}

export default MapSearch;
