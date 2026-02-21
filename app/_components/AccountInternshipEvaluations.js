"use client";

import { useSearchParams } from "next/navigation";

function AccountInternshipEvaluations() {
  const searchParams = useSearchParams();

  if (searchParams.get("filter") !== "evaluations") return null;

  return <div>Evaluations</div>;
}

export default AccountInternshipEvaluations;
