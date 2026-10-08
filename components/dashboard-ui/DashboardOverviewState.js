"use client";

import DashboardOverviewSkeleton from "@/components/skeletons/DashboardOverviewSkeleton";
import ErrorUI from "@/components/ui/ErrorUI";

export default function DashboardOverviewState({ query, role }) {
  if (query.isPending) {
    return <DashboardOverviewSkeleton role={role} />;
  }
  if (query.isError) {
    return <ErrorUI error={query.error} reset={() => void query.refetch()} logError={false} />;
  }
  return null;
}
