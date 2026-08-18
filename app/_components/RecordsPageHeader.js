import { ClipboardList, Search } from "lucide-react";

function RecordsPageHeader({ query, setQuery, isPending }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-primary-500" />
            Internship Records
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Review, approve and monitor every internship record in your
            department.
          </p>
        </div>
      </div>

      <div className="relative md:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          placeholder="Search student, company or course..."
          aria-label="Search internship records"
          className="w-full rounded-lg border border-stone-200 bg-background py-3 pl-9 pr-3 text-sm outline-none focus:border-primary-500"
        />
      </div>
    </div>
  );
}

export default RecordsPageHeader;
