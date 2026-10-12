import { ClipboardList, Loader2, Search } from "lucide-react";
import PageTitle from "../ui/PageTitle";
import ManualDialog from "../ui/ManualDialog";

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
          titleAction={
            <ManualDialog title="How to manage internship records">
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>Use this page to review student placements and manage their approval status.</p>
                <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
                  <li>Search by student, company, or course, or choose a status tab to narrow the records. Select <strong>See more</strong> to load additional results.</li>
                  <li>Review a <strong>Pending Approval</strong> record before selecting <strong>Approve</strong> or <strong>Reject</strong>. Confirm the action in the dialog. Approved records become ongoing.</li>
                  <li>Use <strong>Restore</strong> to return a rejected record to pending review. For an ongoing record, select <strong>Mark Finished</strong> when the internship is complete.</li>
                  <li>Select a student&apos;s name or <strong>View Record</strong> to inspect the overview, DTR, narratives, evaluations, and documents. For an ongoing record, the DTR tab also lets authorized staff set the allowed attendance location.</li>
                </ol>
              </div>
            </ManualDialog>
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
