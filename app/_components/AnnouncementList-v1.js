"use client";

import { Pin } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementsFilter from "./AnnouncementsFilter";
import { useMemo, useState } from "react";
import AnnouncementSearch from "./AnnouncementSearch";

function AnnouncementList({ params, announcementData, user, categories }) {
  const filteredByCategory = params.category || "all";

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const filteredAnnouncements = useMemo(() => {
    let result = [...announcementData];

    if (filteredByCategory !== "all") {
      result = result.filter(
        (announcement) =>
          announcement.category.toLowerCase() === filteredByCategory,
      );
    } else if (filteredByCategory === "all") {
      result = [...announcementData];
    }

    if (query.trim()) {
      result = result.filter((announcement) =>
        announcement.title.toLowerCase().includes(query.toLowerCase()),
      );
    }

    return result;
  }, [announcementData, filteredByCategory, query]);

  const pinnedAnnouncements = filteredAnnouncements.filter(
    (announcement) => announcement.is_pinned,
  );

  const otherAnnouncements = filteredAnnouncements.filter(
    (announcement) => !announcement.is_pinned,
  );

  const isPinnedExist = pinnedAnnouncements.length > 0;

  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <AnnouncementsFilter
          categories={categories}
          filteredByCategory={filteredByCategory}
        />

        <AnnouncementSearch
          filteredAnnouncements={filteredAnnouncements}
          search={search}
          setSearch={setSearch}
          setQuery={setQuery}
        />
      </div>

      <div className="flex-1 flex-col">
        {!announcementData.length && (
          <p className="w-full text-center">No announcements found.</p>
        )}

        {pinnedAnnouncements.length > 0 ? (
          <>
            <span className="flex gap-1 items-center mb-2 font-semibold">
              <Pin className="h-4 w-4" /> Pinned
            </span>
            <ul className="flex flex-col gap-4">
              {pinnedAnnouncements.map((announcement) => (
                <li
                  key={announcement.id}
                  className="w-full p-4 bg-white rounded-sm shadow-sm"
                >
                  <AnnouncementCard
                    announcement={announcement}
                    user={user.user}
                    categories={categories}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {otherAnnouncements.length > 0 ? (
          <ul
            className={`flex flex-col gap-4 ${isPinnedExist ? "mt-10" : "mt-4"}`}
          >
            {otherAnnouncements.map((announcement) => (
              <li
                key={announcement.id}
                className="w-full p-4 bg-white rounded-sm shadow-sm"
              >
                <AnnouncementCard
                  announcement={announcement}
                  user={user.user}
                  categories={categories}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}

export default AnnouncementList;
