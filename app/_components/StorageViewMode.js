"use client";

import { Grid3X3, List } from "lucide-react";
import Link from "next/link";

function StorageViewMode({ viewedBy, filteredBy }) {
  return (
    <div className="flex border border-border rounded-sm overflow-hidden">
      <ViewButton
        viewParams={viewedBy}
        href={`/student/storage?filter=${filteredBy}&view=list`}
        value={"list"}
        icon={<List className="h-4 w-4" />}
      />
      <ViewButton
        viewParams={viewedBy}
        href={`/student/storage?filter=${filteredBy}&view=tiles`}
        value={"tiles"}
        icon={<Grid3X3 className="h-4 w-4" />}
      />
    </div>
  );
}

function ViewButton({ viewParams, href, icon, value }) {
  const active = viewParams === value;

  return (
    <Link
      href={href}
      className={`${active ? "bg-red-100 text-primary-emphasis" : "hover:bg-secondary"} p-2 transition-colors`}
      title={value}
    >
      {icon}
    </Link>
  );
}

export default StorageViewMode;
