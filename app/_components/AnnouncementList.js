"use client";

import { useState, useEffect } from "react";
import { Pin } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementsFilter from "./AnnouncementsFilter";
import AnnouncementSearch from "./AnnouncementSearch";
import SeeMoreButton from "./SeeMoreButton";
import { fetchMoreAnnouncements } from "@/lib/server-actions/announcements-actions";

function AnnouncementList({
  filteredByCategory,
  announcementData: initialData,
  categories,
  search,
}) {
  // --- 1. LOCAL STATE ---
  const [announcements, setAnnouncements] = useState(
    initialData?.regular || [],
  );
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);

  // --- 2. THE SYNC (RESET) ---
  // When category or search changes via URL, initialData updates from server.
  // We reset our local scroll state to match.
  useEffect(() => {
    setAnnouncements(initialData?.regular || []);
    setPage(1);
    setTotalPages(initialData?.totalPages || 1);
  }, [initialData]);

  // --- 3. LOAD MORE LOGIC ---
  async function handleLoadMore() {
    setIsPending(true);
    const nextPage = page + 1;

    try {
      // Call your existing service/API
      const newData = await fetchMoreAnnouncements({
        category: filteredByCategory,
        search: search,
        page: nextPage,
      });

      setAnnouncements((prev) => [...prev, ...newData.regular]);
      setPage(nextPage);
      setTotalPages(newData.totalPages);
    } catch (error) {
      console.error("Error loading more announcements:", error);
    } finally {
      setIsPending(false);
    }
  }

  // --- 4. GHOST FILTER ---
  // Ensure that if something is in the Pinned array, it doesn't show in the Regular list
  const pinnedAnnouncements = initialData?.pinned || [];
  const pinnedIds = new Set(pinnedAnnouncements.map((p) => p.id));
  const filteredRegular = announcements.filter((a) => !pinnedIds.has(a.id));

  const isPinnedExist = pinnedAnnouncements.length > 0;

  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <AnnouncementsFilter
          categories={categories}
          filteredByCategory={filteredByCategory}
          search={search}
        />
        <AnnouncementSearch
          filteredByCategory={filteredByCategory}
          search={search}
        />
      </div>

      <div className="flex-1 flex-col">
        {/* Pinned Section */}
        {isPinnedExist && (
          <>
            <span className="flex gap-1 items-center mb-2 font-semibold">
              <Pin className="h-4 w-4" /> Pinned
            </span>
            <ul className="flex flex-col gap-4">
              {pinnedAnnouncements.map((announcement) => (
                <li
                  key={`pinned-${announcement.id}`}
                  className="w-full p-4 bg-white rounded-xl shadow-sm border border-stone-200"
                >
                  <AnnouncementCard
                    announcement={announcement}
                    categories={categories}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Regular Section */}
        {filteredRegular.length > 0 ? (
          <ul
            className={`flex flex-col gap-4 ${isPinnedExist ? "mt-10" : "mt-4"}`}
          >
            {filteredRegular.map((announcement) => (
              <li
                key={`reg-${announcement.id}`}
                className="w-full p-4 bg-white rounded-xl shadow-sm border border-stone-200"
              >
                <AnnouncementCard
                  announcement={announcement}
                  categories={categories}
                />
              </li>
            ))}
          </ul>
        ) : (
          page === 1 && (
            <p className="text-center py-10 text-stone-500">
              No announcements found.
            </p>
          )
        )}
      </div>

      {/* Manual "See More" Button */}
      <SeeMoreButton
        onClick={handleLoadMore} // Changed from href to onClick
        isPending={isPending}
        currentPage={page}
        totalPages={totalPages}
        label="announcement"
      />
    </>
  );
}

export default AnnouncementList;
