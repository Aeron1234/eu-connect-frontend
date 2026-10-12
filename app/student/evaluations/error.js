"use client";

import ErrorUI from "@/components/ui/ErrorUI";

export default function EvaluationsError({ error, reset }) {
  return <ErrorUI error={error} reset={reset} />;
}
