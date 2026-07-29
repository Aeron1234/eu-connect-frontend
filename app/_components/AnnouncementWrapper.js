import { Suspense } from "react";
import { getAllAnnouncements } from "../_services/services";
import AnnouncementList from "./AnnouncementList";
import SpinnerBig from "./SpinnerBig";

async function AnnouncementWrapper({ params, user, categories }) {
  const filteredByCategory = params.category || "all";
  const searchValue = params.search || "";

  const announcementData = await getAllAnnouncements({
    category: filteredByCategory,
    search: searchValue,
  });

  return (
    <Suspense fallback={<SpinnerBig />}>
      <AnnouncementList
        announcementData={announcementData}
        user={user}
        categories={categories}
        filteredByCategory={filteredByCategory}
        search={searchValue}
      />
    </Suspense>
  );
}

export default AnnouncementWrapper;
