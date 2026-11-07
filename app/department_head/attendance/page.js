import Link from "next/link";
import { ClipboardClock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import DtrTable from "@/components/dtr-ui/DtrTable";
import HelpManual from "@/components/help-ui/HelpManual";
import { getDepartmentAttendance } from "@/lib/server-actions/department-attendance-actions";
import FilterSelectField from "@/components/ui/FilterSelectField";

export const metadata = { title: "Attendance" };

export default async function AttendancePage({ searchParams }) {
  const input = await searchParams;
  const filters = {
    search: typeof input.search === "string" ? input.search : "",
    company: typeof input.company === "string" ? input.company : "",
    courseId: typeof input.courseId === "string" ? input.courseId : "",
    internshipId: typeof input.internshipId === "string" ? input.internshipId : "",
    from: typeof input.from === "string" ? input.from : "",
    through: typeof input.through === "string" ? input.through : "",
    page: typeof input.page === "string" ? input.page : "1",
  };
  let data;
  try { data = await getDepartmentAttendance(filters); }
  catch (error) {
    return <main className="p-4 sm:p-6 lg:p-8"><h1 className="text-2xl font-semibold">Attendance</h1><div role="alert" className="mt-6 rounded-xl border border-border bg-card p-6"><p>Could not load attendance: {error.message}</p><Link className="mt-3 inline-block text-primary-emphasis hover:underline" href="/department_head/attendance">Try again</Link></div></main>;
  }
  function pageHref(page) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, page })) if (value) params.set(key, String(value));
    return `/department_head/attendance?${params}`;
  }
  return <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="flex items-center gap-2 text-2xl font-semibold"><ClipboardClock className="size-6 text-primary-emphasis" />Attendance <HelpManual guideId="department-attendance" /></h1><p className="mt-1 text-sm text-muted-foreground">Review your department’s time records and clock-in/out photos.</p></div>
      <Link href="/dtr-restrictions" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><MapPin className="size-4" />DTR Restrictions</Link>
    </div>
    <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Attendance filters">
      <label className="text-xs font-medium">Student name<input name="search" defaultValue={filters.search} placeholder="Search student" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <label className="text-xs font-medium">Company<input name="company" defaultValue={filters.company} placeholder="Search placement" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <FilterSelectField key={`course-${filters.courseId}`} name="courseId" label="Course" value={filters.courseId} options={[{ value: "", label: "All courses" }, ...data.courses.map(course => ({ value: String(course.id), label: course.short_name || course.course_name }))]} />
      <label className="text-xs font-medium">From<input type="date" name="from" defaultValue={filters.from} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <label className="text-xs font-medium">Through<input type="date" name="through" defaultValue={filters.through} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <div className="flex items-end gap-2"><button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Apply</button><Link href="/department_head/attendance" className="grid h-10 place-items-center rounded-md border border-border px-4 text-sm">Reset</Link></div>
    </form>
    <section className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6" aria-label="Department time records">
      <div className="mb-3 text-sm text-muted-foreground">{data.total} time {data.total === 1 ? "record" : "records"} · Page {data.page} of {data.totalPages}</div>
      <DtrTable dtrs={data.rows} showStudent />
      <nav aria-label="Attendance pages" className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-3 text-sm">
        {data.page > 1 ? <Link href={pageHref(data.page - 1)} aria-label="Previous page" className="rounded-md border border-border p-2 hover:bg-muted"><ChevronLeft className="size-4" /></Link> : <span className="rounded-md border border-border p-2 opacity-40"><ChevronLeft className="size-4" /></span>}
        <span>Page {data.page} / {data.totalPages}</span>
        {data.page < data.totalPages ? <Link href={pageHref(data.page + 1)} aria-label="Next page" className="rounded-md border border-border p-2 hover:bg-muted"><ChevronRight className="size-4" /></Link> : <span className="rounded-md border border-border p-2 opacity-40"><ChevronRight className="size-4" /></span>}
      </nav>
    </section>
  </main>;
}
