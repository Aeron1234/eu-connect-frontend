"use client";

import { ClipboardList } from "lucide-react";
import ErrorUI from "@/components/ui/ErrorUI";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TabBar from "../ui/TabBar";
import AnnualReportSkeleton from "../skeletons/AnnualReportSkeleton";
import AnnexCReportForm from "./AnnexCReportForm";
import AnnexCReportFilters from "./AnnexCReportFilters";
import AnnexCReportCard from "./AnnexCReportCard";
import SippSeeMoreButton from "./SippSeeMoreButton";
import useAnnexCReports from "./useAnnexCReports";

const innerTabs = [
  { value: "form", text: "Form" },
  { value: "reports", text: "Reports" },
];

export default function AnnexCManager({ hei, address, initialPage }) {
  const {
    tab, onTabSelect, reports, reportsQuery, isPending, isChangingFilters,
    handleSeeMore, formProps, filterProps, cardProps, confirmationProps,
  } = useAnnexCReports(initialPage);
  const form = <AnnexCReportForm hei={hei} address={address} {...formProps} />;

  return (
    <div>
      <ConfirmDialog {...confirmationProps} />
      <div className="mb-6 rounded-xl bg-secondary p-1.5 sm:w-fit">
        <TabBar tabs={innerTabs} selectedTab={tab} onSelect={onTabSelect} />
      </div>

      {tab === "form" ? form : (
        <div className="space-y-5">
          <AnnexCReportFilters {...filterProps} />

          {!isChangingFilters && reportsQuery.error && reportsQuery.data && (
            <ErrorUI error={reportsQuery.error} compact logError={false} reset={() => {
              if (reportsQuery.isFetchNextPageError) void reportsQuery.fetchNextPage();
              else void reportsQuery.refetch();
            }} />
          )}

          {isPending ? (
            <AnnualReportSkeleton />
          ) : reportsQuery.error && !reportsQuery.data ? (
            <ErrorUI error={reportsQuery.error} reset={() => void reportsQuery.refetch()} logError={false} />
          )
          : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
              <ClipboardList className="size-8 text-foreground-faint" />
              <p className="text-sm text-muted-foreground">No reports found</p>
            </div>
          ) : (
            reports.map((r) => (
              <AnnexCReportCard key={r.id} report={r} {...cardProps} form={form} />
            ))
          )}

          <SippSeeMoreButton isPending={isPending} query={reportsQuery} onSeeMore={handleSeeMore} />
        </div>
      )}
    </div>
  );
}
