import MapWrapper from "@/app/_components/MapWrapper";
import PageContainer from "@/app/_components/PageContainer";
import PageTitle from "@/app/_components/PageTitle";
import { auth } from "@/app/_services/auth";

import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Map",
};

async function MapPage() {
  const session = await auth();
  if (!session?.user) return notFound();

  const role = session.user.role;
  if (role !== "admin") return notFound();

  return (
    <PageContainer>
      <PageTitle title={"Map"} />

      <div className="flex-1 rounded-md p-4 shadow-sm bg-white flex flex-col gap-2 items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <MapWrapper />
        </Suspense>
      </div>
    </PageContainer>
  );
}

export default MapPage;
