"use client";

import { useState } from "react";
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-secondary shadow-sm p-1.5 sm:w-fit">
        <TabBar tabs={scopeTabs} selectedTab={scope} onSelect={setScope} />
      </div>

      {scope === "annex-c" ? (
        <AnnexCManager
          hei={hei}
          address={address}
          availableAcadYear={availableAcadYear}
          initialReports={initialAnnexC?.reports}
          pagination={initialAnnexC?.pagination}
          academicYear={initialAnnexC?.academicYear}
        />
      ) : (
        <AnnexDHteList
          availableAcadYear={availableAcadYear}
          initialData={initialAnnexD?.companies}
          pagination={initialAnnexD?.pagination}
          academicYear={initialAnnexD?.academicYear}
        />
      )}
    </div>
  );
}

export default SIPPReportsManager;
