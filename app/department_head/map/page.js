import MapWrapper from "@/app/_components/MapWrapper";
import { getMapLocations } from "@/app/_services/dept-head-actions";

export const metadata = {
  title: "Map",
};

async function MapPage() {
  const studentLocationsData = await getMapLocations();

  console.log(studentLocationsData);

  return (
    <MapWrapper
      initialData={studentLocationsData?.companies || []}
      regions={studentLocationsData?.availableRegions || []}
    />
  );
}

export default MapPage;
