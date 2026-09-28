import MapWrapper from "@/app/_components/MapWrapper";
import { getMapLocations } from "@/lib/server-actions/map-actions";

export const metadata = {
  title: "Map",
};

export const dynamic = "force-dynamic";

async function MapPage() {
  const studentLocationsData = await getMapLocations();

  return (
    <MapWrapper
      initialData={studentLocationsData?.companies || []}
      regions={studentLocationsData?.availableRegions || []}
    />
  );
}

export default MapPage;
