"use client";

import { Grid3X3, List } from "lucide-react";
import Link from "next/link";
import UseTooltip from "./UseTooltip";

function StorageViewMode({ viewedBy, filteredBy }) {
  return (
    <div className="flex border border-stone-400 rounded-sm overflow-hidden">
      <ViewButton
        viewParams={viewedBy}
        href={`/student/storage?filter=${filteredBy}&view=list`}
        value={"list"}
        icon={<List size={18} />}
      />
      <ViewButton
        viewParams={viewedBy}
        href={`/student/storage?filter=${filteredBy}&view=tiles`}
        value={"tiles"}
        icon={<Grid3X3 size={18} />}
      />
    </div>
  );
}

function ViewButton({ viewParams, href, icon, value }) {
  const active = viewParams === value;

  return (
    <UseTooltip
      label={value}
      className={"w-fit border-r last:border-r-0 border-stone-400 rounded-none"}
    >
      <Link
        href={href}
        className={`${active ? "bg-red-100 text-primary-500" : "hover:bg-stone-200"} p-2 transition-colors`}
      >
        {icon}
      </Link>
    </UseTooltip>
  );
}

export default StorageViewMode;
