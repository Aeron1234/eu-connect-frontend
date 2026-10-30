"use client";
import ErrorUI from "@/components/ui/ErrorUI";

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
  initialScope = 'annex-c',
}) {
  const [scope, setScope] = useState(initialScope);
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

      {scope === "annex-d" && yearsQuery.isError && yearsQuery.data && (
        <ErrorUI error={yearsQuery.error} reset={() => void yearsQuery.refetch()} compact logError={false} />
      )}

      {scope === "annex-c" ? (
        <AnnexCManager
          hei={hei}
          address={address}
          initialPage={initialAnnexC}
        />
      ) : yearsQuery.isError && !yearsQuery.data ? (
        <ErrorUI error={yearsQuery.error} reset={() => void yearsQuery.refetch()} logError={false} />
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
