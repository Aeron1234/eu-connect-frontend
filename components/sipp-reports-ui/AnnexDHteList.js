"use client";

import { FileText } from "lucide-react";
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
        <ErrorUI error={companiesQuery.error} compact logError={false} reset={() => {
          if (companiesQuery.isFetchNextPageError) void companiesQuery.fetchNextPage();
          else void companiesQuery.refetch();
        }} />
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
