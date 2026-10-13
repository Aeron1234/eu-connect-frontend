"use client";

import ErrorUI from "@/components/ui/ErrorUI";

export default function NarrativesError({ error, reset }) {
  return <ErrorUI error={error} reset={reset} />;
}
