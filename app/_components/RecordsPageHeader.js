import { ClipboardList, Search } from "lucide-react";
import PageTitle from "./PageTitle";

function RecordsPageHeader({ query, setQuery, isPending }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={ClipboardList}
          title={"Internship Records"}
          description={
            "Review, approve and monitor every internship record in your department."
          }
        />
      </div>

      <div className="relative md:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          placeholder="Search student, company or course..."
          aria-label="Search internship records"
          className="w-full rounded-lg border border-border bg-background py-3 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

export default RecordsPageHeader;
