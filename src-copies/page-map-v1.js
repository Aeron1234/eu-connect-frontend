import MapWrapper from "@/app/_components/MapWrapper";
import PageContainer from "@/app/_components/PageContainer";
import PageTitle from "@/app/_components/PageTitle";
import { getActiveInternships } from "@/app/_services/services";
import { MapPin } from "lucide-react";

import { Suspense } from "react";

export const metadata = {
  title: "Map",
};

async function MapPage({ searchParams }) {
  const params = await searchParams;

  const activeInternships = await getActiveInternships();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-maroon sm:text-3xl">
          <MapPin className="h-7 w-7 text-maroon" />
          Student Map
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Showing all the interns across the map
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <MapWrapper activeInternships={activeInternships} params={params} />
      </Suspense>
    </main>
  );
}

export default MapPage;
