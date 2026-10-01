"use client";

import { useState, useEffect, useRef } from "react";
import { Pin } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementsFilter from "./AnnouncementsFilter";
import AnnouncementSearch from "./AnnouncementSearch";
import SeeMoreButton from "./SeeMoreButton";
import { fetchMoreAnnouncements } from "@/lib/server-actions/announcements-actions";
import { canKeepLoadedPages, hasValidPage, pageAfterRefresh, reconcilePageOne } from "@/lib/see-more-pagination.mjs";

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
  const requestIdRef = useRef(0);
  const firstPageIdsRef = useRef((initialData?.regular || []).map((item) => item.id));
  const firstPageTotalRef = useRef(initialData?.totalRecords || 0);
  const lastSnapshotRef = useRef({ data: initialData, category: filteredByCategory, search });

  // --- 2. THE SYNC (RESET) ---
  // When category or search changes via URL, initialData updates from server.
  // We reset our local scroll state to match.
  useEffect(() => {
    const previous = lastSnapshotRef.current;
    if (previous.data === initialData && previous.category === filteredByCategory && previous.search === search) return;
    lastSnapshotRef.current = { data: initialData, category: filteredByCategory, search };
    if (!hasValidPage(initialData, "regular", null)) return;
    const keepLoadedPages = previous.category === filteredByCategory && previous.search === search && canKeepLoadedPages(
      firstPageIdsRef.current,
      firstPageTotalRef.current,
      initialData.regular,
      initialData.totalRecords,
    );
    firstPageIdsRef.current = initialData.regular.map((item) => item.id);
    firstPageTotalRef.current = initialData.totalRecords;
    if (!keepLoadedPages) {
      requestIdRef.current += 1;
      setIsPending(false);
    }
    setAnnouncements((current) => reconcilePageOne(current, initialData.regular, keepLoadedPages));
    setPage((current) => pageAfterRefresh(current, keepLoadedPages));
    setTotalPages(initialData?.totalPages || 1);
  }, [initialData, filteredByCategory, search]);

  // --- 3. LOAD MORE LOGIC ---
  async function handleLoadMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      // Call your existing service/API
      const newData = await fetchMoreAnnouncements({
        category: filteredByCategory,
        search: search,
        page: nextPage,
      });

      if (thisRequestId !== requestIdRef.current) return;
      if (!hasValidPage(newData, "regular", null, nextPage)) {
        console.error("Error loading more announcements:", newData?.error || "Invalid response from the server");
        return;
      }
      setAnnouncements((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        return [...prev, ...newData.regular.filter((item) => !existingIds.has(item.id))];
      });
      setPage(nextPage);
      setTotalPages(newData.totalPages);
    } catch (error) {
      if (thisRequestId === requestIdRef.current) console.error("Error loading more announcements:", error);
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
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
                  className="w-full p-4 bg-card rounded-xl shadow-sm border border-border"
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
                className="w-full p-4 bg-card rounded-xl shadow-sm border border-border"
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
            <p className="text-center py-10 text-muted-foreground">
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
