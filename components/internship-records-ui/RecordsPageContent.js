"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import InternshipRecordsPageSkeleton from "@/components/skeletons/InternshipRecordsPageSkeleton";
import RecordCardSkeleton from "@/components/skeletons/RecordCardSkeleton";
import RecordsPageHeader from "./RecordsPageHeader";
import RecordsPageFilter from "./RecordsPageFilter";
import RecordListCard from "./RecordListCard";
import useRecordsList from "./useRecordsList";

function RecordsPageContent(props) {
  const {
    recordsQuery, query, setQuery, filter, setFilter, stats, total,
    records, isSearching, isLoadingMore, cardProps, confirmationProps,
  } = useRecordsList(props);

  if (recordsQuery.isPending && !recordsQuery.data) {
    return <InternshipRecordsPageSkeleton />;
  }

  if (recordsQuery.isError && !recordsQuery.data) {
    return <ErrorUI error={recordsQuery.error} reset={() => void recordsQuery.refetch()} logError={false} />;
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog {...confirmationProps} />
      <RecordsPageHeader
        query={query}
        setQuery={setQuery}
        isPending={isSearching}
      />

      <RecordsPageFilter
        filter={filter}
        onSelect={setFilter}
        stats={stats}
        totalItems={total}
      />

      {!isSearching && recordsQuery.isError && recordsQuery.data && (
        <ErrorUI error={recordsQuery.error} compact logError={false} reset={() => {
          if (recordsQuery.isFetchNextPageError) void recordsQuery.fetchNextPage();
          else void recordsQuery.refetch();
        }} />
      )}
      <div className="space-y-3" aria-busy={isSearching}>
          {isSearching ? (
            <div role="status" aria-label="Loading filtered internship records" className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => <RecordCardSkeleton key={index} />)}
            </div>
          ) : records.map((r) => (
            <RecordListCard key={r.id} record={r} {...cardProps} />
          ))}

          {records.length === 0 && !isSearching ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
              <p className="text-sm text-muted-foreground">
                No internship records match your filters.
              </p>
            </div>
          ) : null}
      </div>

      {!isSearching && recordsQuery.hasNextPage && (
        <div className="w-full text-center">
          <button
            type="button"
            onClick={() => void recordsQuery.fetchNextPage()}
            disabled={isLoadingMore}
            className="text-sm sm:text-base font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordsPageContent;
