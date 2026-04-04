"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function ExistingAccountFilter({ roles }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to make display names pretty
  function formatRoleName(roleName) {
    return roleName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function handleChange(value) {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }

    // This immediately updates the URL: /admin/accounts?role=student
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="h-full text-stone-600">
      <Select
        onValueChange={handleChange}
        defaultValue={searchParams.get("role") || "all"}
      >
        <SelectTrigger className="font-medium h-7.5 w-48 px-2 bg-stone-100 text-sm rounded-sm border border-stone-300 focus:ring-2 focus:ring-stone-300">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Roles</SelectLabel>
          </SelectGroup>
          <SelectGroup>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) =>
              role.role !== "admin" ? (
                <SelectItem key={role.id} value={role.role}>
                  {formatRoleName(role.role)}
                </SelectItem>
              ) : null,
            )}
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default ExistingAccountFilter;
