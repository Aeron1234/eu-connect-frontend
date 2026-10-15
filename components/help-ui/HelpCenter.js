"use client";

import { CircleHelp } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import useHelpGuides from "./useHelpGuides";
import HelpSearch from "./HelpSearch";
import HelpGuideSections from "./HelpGuideSections";
import HelpContact from "./HelpContact";

export default function HelpCenter() {
  const { query, setQuery, role, accountHref, visibleSections } = useHelpGuides();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageTitle Icon={CircleHelp} title="Help" description="Find answers and follow the steps for your role in EU-Connect." />

      <HelpSearch role={role} query={query} setQuery={setQuery} />

      <HelpGuideSections visibleSections={visibleSections} accountHref={accountHref} />

      <HelpContact />
    </div>
  );
}
