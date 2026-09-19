// app/_components/AccountFilterChips.js
"use client";

import DropdownFilter from "./DropdownFilter";

function formatRoleName(roleName) {
  return roleName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const statusOptions = ["active", "inactive", "suspended"];

function AccountDropdownFilter({ roles = [], value, onChange }) {
  const options = [
    { value: "all", label: "All" },
    ...roles
      .filter((r) => r.role !== "admin")
      .map((r) => ({ value: r.role, label: formatRoleName(r.role) })),
    ...statusOptions.map((s) => ({ value: s, label: formatRoleName(s) })),
  ];

  return (
    <DropdownFilter
      value={value}
      onValueChange={onChange}
      options={options}
      placeholder="Filter"
      className="bg-white p-2"
    />
  );
}

export default AccountDropdownFilter;
