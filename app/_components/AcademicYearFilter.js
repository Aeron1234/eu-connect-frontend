// app/_components/AcademicYearFilter.js
"use client";

import DropdownFilter from "./DropdownFilter";

function AcademicYearFilter({ academicYears = [], value, onChange }) {
  const options = [
    { value: "all", label: "All" },
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
      className="bg-white p-2 flex-1 sm:flex-0 rounded-md"
    />
  );
}

export default AcademicYearFilter;
