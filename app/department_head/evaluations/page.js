import Link from "next/link";
import { ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import HelpManual from "@/components/help-ui/HelpManual";
import { getDepartmentEvaluations } from "@/lib/server-actions/department-evaluations-actions";
import FilterSelectField from "@/components/ui/FilterSelectField";

export const metadata = { title: "Evaluations" };

const typeLabels = {
  performance: "Supervisor → student",
  company: "Student to company",
};

export default async function EvaluationsPage({ searchParams }) {
  const input = await searchParams;
  const filters = Object.fromEntries(
    ["search", "company", "type", "status", "courseId", "internshipId", "evaluationId", "from", "through", "page"]
      .map(key => [key, typeof input[key] === "string" ? input[key] : key === "page" ? "1" : ""]),
  );
  let data;
  try { data = await getDepartmentEvaluations(filters); }
  catch (error) {
    return <main className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold">Evaluations</h1>
      <div role="alert" className="mt-6 rounded-xl border border-border bg-card p-6">
        <p>Could not load evaluations: {error.message}</p>
        <Link href="/department_head/evaluations" className="mt-3 inline-block text-primary-emphasis hover:underline">Try again</Link>
      </div>
    </main>;
  }
  function pageHref(page) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, page })) if (value) params.set(key, String(value));
    return `/department_head/evaluations?${params}`;
  }
  return <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
    <header>
      <h1 className="flex items-center gap-2 text-2xl font-semibold"><ClipboardCheck className="size-6 text-primary-emphasis" />Evaluations <HelpManual guideId="department-evaluations" /></h1>
      <p className="mt-1 text-sm text-muted-foreground">Review evaluations for students in your department. Employer evaluations of students remain confidential.</p>
    </header>
    {filters.evaluationId && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">Showing the evaluation from your notification.<Link href="/department_head/evaluations" className="font-medium text-primary-emphasis hover:underline">View all evaluations</Link></div>}
    <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Evaluation filters">
      <label className="text-xs font-medium">Student name<input name="search" defaultValue={filters.search} placeholder="Search student" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <label className="text-xs font-medium">Company<input name="company" defaultValue={filters.company} placeholder="Search placement" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <FilterSelectField key={`type-${filters.type}`} name="type" label="Evaluation type" value={filters.type} options={[{ value: "", label: "Both types" }, { value: "performance", label: "Supervisor → student" }, { value: "company", label: "Student to company" }]} />
      <FilterSelectField key={`status-${filters.status}`} name="status" label="Status" value={filters.status} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Submitted" }, { value: "deleted", label: "Deleted by author" }]} />
      <FilterSelectField key={`course-${filters.courseId}`} name="courseId" label="Course" value={filters.courseId} options={[{ value: "", label: "All courses" }, ...data.courses.map(course => ({ value: String(course.id), label: course.short_name || course.course_name }))]} />
      <label className="text-xs font-medium">Submitted from<input type="date" name="from" defaultValue={filters.from} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <label className="text-xs font-medium">Submitted through<input type="date" name="through" defaultValue={filters.through} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <div className="flex items-end gap-2"><button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Apply</button><Link href="/department_head/evaluations" className="grid h-10 place-items-center rounded-md border border-border px-4 text-sm">Reset</Link></div>
    </form>
    <section className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6" aria-label="Department evaluations">
      <p className="mb-3 text-sm text-muted-foreground">{data.total} {data.total === 1 ? "evaluation" : "evaluations"} · Page {data.page} of {data.totalPages}</p>
      {data.rows.length ? <div className="max-w-full overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-3 pr-4">Student</th><th className="py-3 pr-4">Type</th><th className="py-3 pr-4">Submitted by</th><th className="py-3 pr-4">Company</th><th className="py-3 pr-4">Submitted</th><th className="py-3 pr-4">Status</th><th className="py-3 text-right">Action</th></tr></thead><tbody>{data.rows.map(row => <tr key={row.id} className="border-b border-border last:border-0"><td className="py-3 pr-4"><span className="font-medium">{row.student_name || "Student"}</span><span className="block text-xs text-muted-foreground">{row.course_short_name || row.course_name || "—"}</span></td><td className="py-3 pr-4 whitespace-nowrap">{typeLabels[row.type] || row.type}</td><td className="py-3 pr-4 whitespace-nowrap">{row.author_name || "—"}</td><td className="max-w-56 truncate py-3 pr-4" title={row.company_name}>{row.company_name || "—"}</td><td className="py-3 pr-4 whitespace-nowrap">{row.submitted_at ? format(parseISO(row.submitted_at.replace(" ", "T")), "MMM d, yyyy h:mm a") : "—"}</td><td className="py-3 pr-4">{row.deleted_at ? <span className="whitespace-nowrap rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">Deleted by author</span> : <span className="whitespace-nowrap rounded-full bg-primary/10 px-2 py-1 text-xs text-primary-emphasis">Submitted</span>}</td><td className="py-3 text-right"><Link className="whitespace-nowrap font-medium text-primary-emphasis hover:underline" href={`/department_head/evaluations/${encodeURIComponent(row.internship_id)}?evaluationId=${encodeURIComponent(row.id)}`}>Review</Link></td></tr>)}</tbody></table></div> : <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">No evaluations match these filters.</p>}
      <nav aria-label="Evaluation pages" className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-3 text-sm">
        {data.page > 1 ? <Link href={pageHref(data.page - 1)} aria-label="Previous page" className="rounded-md border border-border p-2 hover:bg-muted"><ChevronLeft className="size-4" /></Link> : <span className="rounded-md border border-border p-2 opacity-40"><ChevronLeft className="size-4" /></span>}
        <span>Page {data.page} / {data.totalPages}</span>
        {data.page < data.totalPages ? <Link href={pageHref(data.page + 1)} aria-label="Next page" className="rounded-md border border-border p-2 hover:bg-muted"><ChevronRight className="size-4" /></Link> : <span className="rounded-md border border-border p-2 opacity-40"><ChevronRight className="size-4" /></span>}
      </nav>
    </section>
  </main>;
}
