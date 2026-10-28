"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import { Megaphone } from "lucide-react";
import PostAnnouncementButton from "../internship-records-ui/PostAnnouncementButton";
import PageTitle from "../ui/PageTitle";
import PageManual from "../ui/PageManual";
import AnnouncementCardSkeleton from "../skeletons/AnnouncementCardSkeleton";
import useAnnouncementBoard from "./useAnnouncementBoard";
import SelectedAnnouncement from "./SelectedAnnouncement";
import AnnouncementGroups from "./AnnouncementGroups";
import AnnouncementBoardFilters from "./AnnouncementBoardFilters";

export default function AnnouncementBoard(props) {
  // A new deep link starts with clear filters and its own scroll/highlight state.
  return <AnnouncementBoardContent key={props.targetId ?? "feed"} {...props} />;
}

function AnnouncementBoardContent(props) {
  const { targetId = null } = props;
  const {
    categoriesQuery,
    categories,
    boardRef,
    targetRef,
    highlightTarget,
    targetQuery,
    focusedAnnouncementId,
    category,
    search,
    announcementsQuery,
    isLoadingMore,
    isSearching,
    handleSearchChange,
    handleCategoryChange,
    refreshList,
    visiblePinned,
    filteredRegular,
    isPinnedExist,
  } = useAnnouncementBoard(props);

  return (
    <div ref={boardRef} className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={Megaphone}
          title={"Announcements"}
          description={"Stay updated with the latest internship news."}
          titleAction={<PageManual page="announcements" />}
        />

        <PostAnnouncementButton
          categories={categories || []}
          categoriesLoading={categoriesQuery.isPending}
          categoriesError={categoriesQuery.error}
          onRetryCategories={() => void categoriesQuery.refetch()}
          onPosted={refreshList}
        />
      </div>

      <AnnouncementBoardFilters
        search={search}
        handleSearchChange={handleSearchChange}
        categories={categories}
        category={category}
        handleCategoryChange={handleCategoryChange}
      />

      <SelectedAnnouncement targetId={targetId} targetQuery={targetQuery} />

      {categoriesQuery.isError && (
        <ErrorUI
          error={categoriesQuery.error}
          reset={() => void categoriesQuery.refetch()}
          compact
          logError={false}
        />
      )}
      {!isSearching &&
        announcementsQuery.isError &&
        announcementsQuery.data && (
          <ErrorUI
            error={announcementsQuery.error}
            compact
            logError={false}
            reset={() => {
              if (announcementsQuery.isFetchNextPageError)
                void announcementsQuery.fetchNextPage();
              else void announcementsQuery.refetch();
            }}
          />
        )}

      {isSearching ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AnnouncementCardSkeleton key={i} showEventDate={i % 2 === 0} />
          ))}
        </div>
      ) : announcementsQuery.isError && !announcementsQuery.data ? (
        <ErrorUI
          error={announcementsQuery.error}
          reset={() => void announcementsQuery.refetch()}
          logError={false}
        />
      ) : (
        <AnnouncementGroups
          isPinnedExist={isPinnedExist}
          visiblePinned={visiblePinned}
          filteredRegular={filteredRegular}
          focusedAnnouncementId={focusedAnnouncementId}
          targetRef={targetRef}
          highlightTarget={highlightTarget}
          categories={categories}
          refreshList={refreshList}
        />
      )}

      {!isSearching && announcementsQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => void announcementsQuery.fetchNextPage()}
          disabled={isLoadingMore}
          className="w-full text-center text-lg font-semibold text-foreground-soft transition hover:text-primary-emphasis disabled:opacity-50"
        >
          {isLoadingMore ? "Loading..." : "See more"}
        </button>
      )}
    </div>
  );
}
