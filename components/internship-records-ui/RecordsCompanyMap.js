"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Map = dynamic(() => import("../map-ui/Map"), {
  ssr: false,
  loading: () => (
    <Skeleton
      className="h-[280px] w-full rounded-xl sm:h-[360px]"
      role="status"
      aria-label="Loading company location map"
    />
  ),
});

function coordinate(value, limit) {
  if (value == null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

export default function RecordsCompanyMap({ record, internshipId }) {
  const sites = useMemo(() => {
    const lat = coordinate(record.lat, 90);
    const lng = coordinate(record.lon, 180);
    if (lat === null || lng === null) return [];

    return [{
      id: internshipId,
      company: record.company_name,
      address: record.company_address,
      lat,
      lng,
      interns: [{
        id: record.student_id,
        name: record.student_name,
        course: record.course_name,
        role: record.internship_position,
      }],
    }];
  }, [record, internshipId]);

  return (
    <section
      aria-labelledby="record-company-location"
      className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-2 sm:p-5"
    >
      <h3 id="record-company-location" className="flex items-center gap-2 text-base font-bold text-primary-emphasis sm:text-lg">
        <MapPin className="size-5 shrink-0" aria-hidden="true" />
        Company Location
      </h3>
      <p className="mt-2 break-words text-sm text-muted-foreground">
        {record.company_address || record.company_name}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl">
        {sites.length ? (
          <Map
            sites={sites}
            selectedId={internshipId}
            fitBoundsMaxZoom={16}
            showPinCount={false}
            className="h-[280px] w-full rounded-xl sm:h-[360px]"
          />
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
            No company location saved for this internship record.
          </p>
        )}
      </div>
    </section>
  );
}
