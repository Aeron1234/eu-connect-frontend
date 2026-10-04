"use client";

import ErrorUI from "@/components/ui/ErrorUI";

export default function DashboardError({ error, reset }) {
  return <ErrorUI error={error} reset={reset} />;
}
