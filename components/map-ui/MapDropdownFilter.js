// app/_components/MapDropdownFilter.js
"use client";

import DropdownFilter from "../ui/DropdownFilter";

function MapDropdownFilter({ regions = [], regionId, onChange }) {
  const options = [
    { value: "", label: "All Locations" },
    ...regions.map((r) => ({ value: String(r.id), label: r.name })),
  ];

  return (
    <DropdownFilter
      value={regionId ? String(regionId) : ""}
      onValueChange={(val) => onChange(val ? Number(val) : null)}
      options={options}
      placeholder="All Locations"
      className="w-full bg-card p-2 sm:w-auto"
    />
  );
}

export default MapDropdownFilter;
