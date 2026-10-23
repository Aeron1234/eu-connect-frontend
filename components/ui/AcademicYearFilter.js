// app/_components/AcademicYearFilter.js
"use client";

import DropdownFilter from "./DropdownFilter";

function AcademicYearFilter({ academicYears = [], value, onChange, className = "bg-card p-2 flex-1 sm:flex-0 rounded-md" }) {
  const options = [
    { value: "all", label: "Academic Year" },
    ...academicYears.map((year) => ({
      value: year.toLowerCase(),
      label: year,
    })),
  ];

  return (
    <DropdownFilter
      value={value}
      onValueChange={onChange}
      options={options}
      placeholder="Academic Year"
      className={className}
    />
  );
}

export default AcademicYearFilter;
