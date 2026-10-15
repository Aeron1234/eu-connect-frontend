"use client";

import { FileText, TriangleAlert } from "lucide-react";
import ErrorUI from "@/components/ui/ErrorUI";
import HTEListSkeleton from "../skeletons/HTEListSkeleton";
import AnnexDFilters from "./AnnexDFilters";
import AnnexDStats from "./AnnexDStats";
import AnnexDCompanyCard from "./AnnexDCompanyCard";
import SippSeeMoreButton from "./SippSeeMoreButton";
import useAnnexDHteList from "./useAnnexDHteList";

export function AnnexDHteList({ availableAcadYear = [], initialPage }) {
  const {
    companies, companiesQuery, isChangingFilters, isPending, handleSeeMore,
    filterProps, statsProps,
  } = useAnnexDHteList(initialPage);

  return (
    <div>
      <AnnexDFilters {...filterProps} availableAcadYear={availableAcadYear} />

      <AnnexDStats {...statsProps} />

      {!isChangingFilters && companiesQuery.error && companiesQuery.data && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <span className="flex items-center gap-2 text-foreground-soft"><TriangleAlert className="size-4 text-destructive" />{companiesQuery.error.message}</span>
          <button type="button" onClick={() => companiesQuery.isFetchNextPageError ? companiesQuery.fetchNextPage() : companiesQuery.refetch()} className="font-semibold text-primary-emphasis hover:underline">Try again</button>
        </div>
      )}

      {isPending ? (
        <HTEListSkeleton />
      ) : companiesQuery.error && !companiesQuery.data ? (
        <ErrorUI error={companiesQuery.error} reset={() => void companiesQuery.refetch()} logError={false} />
      )
      : companies.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <FileText className="size-8 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">No placements found</p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different academic year or clear the search filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4 sm:space-y-5">
          {companies.map((c) => (
            <AnnexDCompanyCard key={c.company_key} company={c} />
          ))}
        </div>
      )}

      <SippSeeMoreButton isPending={isPending} query={companiesQuery} onSeeMore={handleSeeMore} className="mt-5 text-center" />
    </div>
  );
}
