"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { getAllAnnouncements } from "../_services/services";
import PostAnnouncementButton from "./PostAnnouncementButton";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementsFilter from "./AnnouncementsFilter";
import SearchBar from "./SearchBar";
import { useUser } from "@/contexts/UserContext";
import PageTitle from "./PageTitle";

function AnnouncementBoard({
  categories = [],
  initialPinned = [],
  initialRegular = [],
  initialTotalPages = 1,
}) {
  const { user } = useUser();
  const userRole = user.role;

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [pinned, setPinned] = useState(initialPinned);
  const [regular, setRegular] = useState(initialRegular);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  async function refreshList() {
    const newData = await getAllAnnouncements({ category, search, page: 1 });
    if (newData?.error) {
      console.error(newData.error);
      return;
    }
    setPinned(newData.pinned || []);
    setRegular(newData.regular || []);
    setPage(1);
    setTotalPages(newData.totalPages || 1);
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const newData = await getAllAnnouncements({
          category,
          search,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error("Error loading announcements:", newData.error);
          setPinned([]);
          setRegular([]);
          setTotalPages(1);
          setPage(1);
          return;
        }

        setPinned(newData.pinned || []);
        setRegular(newData.regular || []);
        setPage(1);
        setTotalPages(newData.totalPages || 1);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading announcements:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [category, search]);

  async function handleSeeMore() {
    if (isSearching || isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getAllAnnouncements({
        category,
        search,
        page: nextPage,
      });

      if (thisRequestId !== requestIdRef.current) return;

      if (newData?.error) {
        console.error("Error loading more announcements:", newData.error);
        return;
      }

      setRegular((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const filteredNew = (newData.regular || []).filter(
          (a) => !existingIds.has(a.id),
        );
        return [...prev, ...filteredNew];
      });

      setPage(nextPage);
      if (newData?.totalPages) setTotalPages(newData.totalPages);
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more announcements:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsLoadingMore(false);
    }
  }

  const pinnedIds = new Set(pinned.map((p) => p.id));
  const filteredRegular = regular.filter((a) => !pinnedIds.has(a.id));
  const isPinnedExist = pinned.length > 0;

  return (
    <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={Megaphone}
          title={"Announcements"}
          description={"Stay updated with the latest internship news."}
        />

        <PostAnnouncementButton
          categories={categories}
          onPosted={refreshList}
        />
      </div>

      <div
        className={`flex ${userRole !== "employer" ? "flex-col gap-4 sm:flex-row sm:items-center" : ""}`}
      >
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements..."
          ariaLabel="Search announcements"
          position={userRole !== "employer" ? "right" : "left"}
        />

        <AnnouncementsFilter
          categories={categories}
          category={category}
          setCategory={setCategory}
        />
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {isPinnedExist && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-500">
                Pinned
              </p>
              <ul className="flex flex-col gap-3">
                {pinned.map((announcement) => (
                  <li key={`pinned-${announcement.id}`}>
                    <AnnouncementCard
                      announcement={announcement}
                      categories={categories}
                      onChanged={refreshList}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {filteredRegular.length > 0 ? (
            <div>
              {isPinnedExist && (
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-400">
                  Earlier
                </p>
              )}
              <ul className="flex flex-col gap-3">
                {filteredRegular.map((announcement) => (
                  <li key={`reg-${announcement.id}`}>
                    <AnnouncementCard
                      announcement={announcement}
                      categories={categories}
                      onChanged={refreshList}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            page === 1 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-white border-stone-200 py-16 text-center">
                <Megaphone className="size-8 text-stone-300" />
                <p className="text-sm text-stone-500">
                  No announcements found.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {!isSearching && page < totalPages && (
        <button
          onClick={handleSeeMore}
          disabled={isLoadingMore}
          className="w-full text-center text-lg font-semibold text-stone-600 transition hover:text-primary-500 disabled:opacity-50"
        >
          {isLoadingMore ? "Loading..." : "See more"}
        </button>
      )}
    </main>
  );
}

export default AnnouncementBoard;
