import MapWrapper from "@/app/_components/MapWrapper";
import PageContainer from "@/app/_components/PageContainer";
import PageTitle from "@/app/_components/PageTitle";
import { getActiveInternships, getUserSession } from "@/app/_services/services";

import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Map",
};

async function MapPage({ searchParams }) {
  const params = await searchParams;

  const activeInternships = await getActiveInternships();

  return (
    <PageContainer>
      <PageTitle
        title={"Map"}
        description="Showing the location of ongoing internships"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <MapWrapper activeInternships={activeInternships} params={params} />
      </Suspense>
    </PageContainer>
  );
}

export default MapPage;
