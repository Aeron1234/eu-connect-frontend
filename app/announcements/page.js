import {
  getAllAnnouncements,
  getAnnouncementCategories,
} from "../_services/services";
import AnnouncementBoard from "../_components/AnnouncementBoard";

export const metadata = {
  title: "Announcements",
};

async function AnnouncementPage() {
  const [categories, announcementData] = await Promise.all([
    getAnnouncementCategories(),
    getAllAnnouncements({ category: "all", search: "", page: 1 }),
  ]);

  return (
    <AnnouncementBoard
      categories={categories || []}
      initialPinned={announcementData?.pinned || []}
      initialRegular={announcementData?.regular || []}
      initialTotalPages={announcementData?.totalPages || 1}
    />
  );
}

export default AnnouncementPage;
