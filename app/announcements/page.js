import { Megaphone } from "lucide-react";
import PageContainer from "../_components/PageContainer";
import PageTitle from "../_components/PageTitle";
import {
  getAnnouncementCategories,
  getUserSession,
} from "../_services/services";

import { Suspense } from "react";
import SpinnerBig from "../_components/SpinnerBig";
import PostAnnouncementButton from "../_components/PostAnnouncementButton";
import AnnouncementWrapper from "../_components/AnnouncementWrapper";

export const metadata = {
  title: "Announcements",
};

async function AnnouncementPage({ searchParams }) {
  const params = await searchParams;

  const [user, categories] = await Promise.all([
    getUserSession(),
    getAnnouncementCategories(),
  ]);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-primary-500" />
            Announcements
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Stay updated with the latest internship news
          </p>
        </div>

        <Suspense fallback={<SpinnerBig />}>
          <PostAnnouncementButton
            user={user || {}}
            categories={categories || []}
          />
        </Suspense>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <Suspense fallback={<SpinnerBig />}>
          {/* <AnnouncementList
            params={params}
            announcementData={announcementData}
            user={user}
            categories={categories}
          /> */}
          <AnnouncementWrapper
            params={params}
            user={user}
            categories={categories}
          />
        </Suspense>
      </div>
    </main>
  );
}

export default AnnouncementPage;
