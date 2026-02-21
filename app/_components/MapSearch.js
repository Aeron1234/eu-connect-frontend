"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

function MapSearch() {
  const [search, setSearch] = useState("");

  function handleSearch(formData) {
    console.log(formData.get("search"));

    setSearch("");
  }

  return (
    <form
      action={handleSearch}
      className="w-full max-w-[350px] rounded-full flex items-center gap-1 self-start justify-self-center"
    >
      <label htmlFor="search-location">
        <MapPin color="var(--color-primary-500)" />
      </label>
      <input
        id="search-location"
        type="text"
        name="search"
        placeholder="Search via location..."
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        className="outline-none px-4 py-2 rounded-full bg-stone-100 w-full"
      />
    </form>
  );
}

export default MapSearch;
