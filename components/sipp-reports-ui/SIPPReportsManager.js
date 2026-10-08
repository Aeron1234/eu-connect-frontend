"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { sippAcademicYearsOptions } from "@/lib/cache/sipp-reports-queries";
import TabBar from "../ui/TabBar";
import AnnexCManager from "./AnnexCManager";
import { AnnexDHteList } from "./AnnexDHteList";

const scopeTabs = [
  { value: "annex-c", text: "Annex C — Annual Reports", shortText: "Annex C" },
  {
    value: "annex-d",
    text: "Annex D — HTE and Intern List",
    shortText: "Annex D",
  },
];

function SIPPReportsManager({
  hei,
  address,
  availableAcadYear = [],
  initialAnnexC,
  initialAnnexD,
}) {
  const [scope, setScope] = useState("annex-c");
  const { user } = useUser();
  const yearsQuery = useQuery({
    ...sippAcademicYearsOptions(user?.id),
    enabled: Boolean(user?.id),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-secondary shadow-sm p-1.5 sm:w-fit">
        <TabBar tabs={scopeTabs} selectedTab={scope} onSelect={setScope} />
      </div>

      {scope === "annex-c" ? (
        <AnnexCManager
          hei={hei}
          address={address}
          initialPage={initialAnnexC}
        />
      ) : yearsQuery.isError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-4 text-sm">
          <p>{yearsQuery.error.message}</p>
          <button type="button" className="mt-2 font-semibold text-primary-emphasis" onClick={() => void yearsQuery.refetch()}>Try again</button>
        </div>
      ) : (
        <AnnexDHteList
          availableAcadYear={yearsQuery.data || availableAcadYear}
          initialPage={initialAnnexD}
        />
      )}
    </div>
  );
}

export default SIPPReportsManager;
