import AnnouncementBoard from "../../components/announcements-ui/AnnouncementBoard";

export const metadata = {
  title: "Announcements",
};

async function AnnouncementPage({ searchParams }) {
  const params = await searchParams;
  const targetId = typeof params?.announcement === "string" ? params.announcement : null;
  return <AnnouncementBoard targetId={targetId} />;
}

export default AnnouncementPage;
