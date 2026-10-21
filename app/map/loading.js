import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import MapLocationsLoading from "@/components/map-ui/MapLocationsLoading";

export default function MapLoading() {
  return (
    <div className="min-w-0 space-y-4 p-4 sm:p-6 lg:space-y-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><PageTitleSkeleton /></div>
        <div className="flex w-full rounded-lg bg-secondary p-1 sm:w-fit" aria-hidden="true">
          {["Map View", "Companies"].map((tab) => (
            <div key={tab} className="min-w-0 flex-1 rounded-md px-3 py-2 sm:flex-none sm:px-4">
              <Skeleton className="h-5 w-16 max-w-full" />
            </div>
          ))}
        </div>
      </div>
      <MapLocationsLoading />
    </div>
  );
}
