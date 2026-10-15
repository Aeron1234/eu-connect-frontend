"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import SelectedCompanyPanel from "./SelectedCompanyPanel";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[540px] w-full rounded-xl" role="status" aria-label="Loading map" />
  ),
});
export default function CompanyMapView({ sites, selectedId, setSelectedId, selected }) {
  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
        <Map
          sites={sites}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <p className="px-2 py-2 text-xs text-muted-foreground">
          Each pin shows the number of interns at that company — click a
          pin to see their names.
        </p>
      </div>

      <SelectedCompanyPanel selected={selected} />
    </div>
  );
}
