"use client";

import { useUser } from "@/contexts/UserContext";
import DropdownFilter from "../ui/DropdownFilter";

function AnnouncementsFilter({ categories, category, setCategory }) {
  const { user } = useUser();

  const userRole = user?.role;
  const isRegistrar = userRole === "department_head" && user?.department_code === "REG";

  if (!["student", "department_head", "admin"].includes(userRole)) return null;
  if (isRegistrar) return null;

  if (!categories || categories.length === 0) return null;

  const options = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.name.toLowerCase(), label: cat.name })),
  ];

  return (
    <DropdownFilter
      value={category}
      onValueChange={setCategory}
      options={options}
      placeholder="Category"
      className="h-10 w-full rounded-md bg-card p-2 text-xs sm:w-[200px]"
    />
  );
}

export default AnnouncementsFilter;
