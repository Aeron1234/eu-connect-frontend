import { ClipboardList, Loader2, Search } from "lucide-react";
import PageTitle from "../ui/PageTitle";
import HelpManual from "@/components/help-ui/HelpManual";

function RecordsPageHeader({ query, setQuery, isPending }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={ClipboardList}
          title={"Internship Records"}
          description={
            "Approve, reject, restore, and review internship placements in your department."
          }
          titleAction={
            <HelpManual guideId="records" title="How to manage internship records" />
          }
        />
      </div>

      <div className="relative md:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student, company or course..."
          aria-label="Search internship records"
          aria-busy={isPending}
          className="w-full rounded-lg border border-border bg-background py-3 pl-9 pr-10 text-sm outline-none focus:border-primary"
        />
        {isPending && (
          <Loader2
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>
    </div>
  );
}

export default RecordsPageHeader;
