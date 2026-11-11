import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import HelpManual from "@/components/help-ui/HelpManual";
import FilterSelectField from "@/components/ui/FilterSelectField";
import { getCompanyEvaluationSummary } from "@/lib/server-actions/company-evaluation-summary-actions";

export const metadata = { title: "Evaluated Companies" };

const rating = (value) => value == null ? "—" : `${Number(value).toFixed(2)} / 5`;

export default async function EvaluatedCompaniesPage({ searchParams }) {
  const input = await searchParams;
  const filters = Object.fromEntries(["courseId", "from", "through", "sort", "page"].map((field) => [field, typeof input[field] === "string" ? input[field] : ""]));
  let data;
  try { data = await getCompanyEvaluationSummary(filters); }
  catch (error) {
    return <main className="p-4 sm:p-6 lg:p-8"><h1 className="text-2xl font-semibold">Evaluated Companies</h1><div role="alert" className="mt-5 rounded-xl border border-border bg-card p-6"><p>{error.message}</p><Link href="/department_head/evaluated-companies" className="mt-2 inline-block text-primary-emphasis hover:underline">Try again</Link></div></main>;
  }
  const activeSort = data.filters.sort || "highest";
  const courseLabel = data.courses.find((course) => String(course.id) === filters.courseId)?.course_name || "All courses";
  const pageHref = (page) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, page })) if (value) params.set(key, String(value));
    return `/department_head/evaluated-companies?${params}`;
  };
  const detailHref = (key) => {
    const params = new URLSearchParams();
    for (const field of ["courseId", "from", "through", "sort", "page"]) if (filters[field]) params.set(field, filters[field]);
    return `/department_head/evaluated-companies/${key}?${params}`;
  };
  return <main className="min-w-0 space-y-5 p-4 sm:p-6 lg:p-8">
    <header><h1 className="flex items-center gap-2 text-2xl font-semibold"><Building2 className="size-6 text-primary-emphasis" />Evaluated Companies <HelpManual guideId="evaluated-companies" /></h1><p className="mt-1 text-sm text-muted-foreground">Compare student feedback about internship companies and their branches.</p></header>
    <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Company rating filters">
      <FilterSelectField key={filters.courseId} name="courseId" label="Course" value={filters.courseId} options={[{ value: "", label: "All courses" }, ...data.courses.map((course) => ({ value: String(course.id), label: course.short_name || course.course_name }))]} />
      <label className="text-xs font-medium">Internship starts from<input type="date" name="from" defaultValue={filters.from} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <label className="text-xs font-medium">Internship starts through<input type="date" name="through" defaultValue={filters.through} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label>
      <FilterSelectField key={activeSort} name="sort" label="Sort by rating" value={activeSort} options={[{ value: "highest", label: "Highest to lowest" }, { value: "lowest", label: "Lowest to highest" }]} />
      <div className="flex items-end gap-2"><button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Apply</button><Link href="/department_head/evaluated-companies" className="grid h-10 place-items-center rounded-md border border-border px-4 text-sm">Reset</Link></div>
    </form>
    <p className="text-sm text-muted-foreground">{data.total} {data.total === 1 ? "company" : "companies"} · {courseLabel} · Internship starts {filters.from || "any date"} to {filters.through || "any date"}. Active evaluations of ongoing or finished internships count.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {[{ label: "Highest rated", item: data.highest }, { label: "Lowest rated", item: data.lowest }].map(({ label, item }) => <div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>{item ? <><p className="mt-2 font-semibold">{item.companyName}</p><p className="text-xs text-muted-foreground">{item.companyAddress || "Address not recorded"}</p><p className="mt-2 text-sm">{rating(item.rating)} · {item.reviewerCount} student {item.limitedFeedback && <span className="text-amber-700 dark:text-amber-300">· Limited feedback</span>}</p></> : <p className="mt-2 text-sm text-muted-foreground">No company evaluations yet.</p>}</div>)}
    </div>
    <section className="space-y-3" aria-label="Company ratings">
      {data.companies.length ? data.companies.map((company) => <article key={company.key} className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-semibold">{company.companyName}</h2><p className="mt-1 text-sm text-muted-foreground">{company.companyAddress || "Address not recorded"}</p></div><div className="flex items-center gap-1 font-semibold text-primary-emphasis"><Star className="size-4" />{rating(company.rating)}</div></div><p className="mt-3 text-sm">{company.reviewerCount} distinct student {company.reviewerCount === 1 ? "reviewer" : "reviewers"} · {company.evaluationCount} {company.evaluationCount === 1 ? "evaluation" : "evaluations"}</p>{company.limitedFeedback && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Limited feedback: fewer than 3 students reviewed this company.</p>}{company.uncertainMatch && <p className="mt-1 text-xs text-muted-foreground">Review grouping: {company.uncertainMatch}</p>}<div className="mt-3 flex flex-wrap gap-2">{company.categories.map((category) => <span key={category.category} className="rounded-full bg-muted px-2.5 py-1 text-xs">{category.category}: {rating(category.rating)}</span>)}</div><Link href={detailHref(company.key)} className="mt-4 inline-block text-sm font-medium text-primary-emphasis hover:underline">View student scores</Link></article>) : <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">No company evaluations match this period and course.</div>}
    </section>
    <nav aria-label="Company pages" className="flex items-center justify-end gap-3 text-sm">{data.page > 1 ? <Link href={pageHref(data.page - 1)} aria-label="Previous page" className="rounded-md border border-border p-2"><ChevronLeft className="size-4" /></Link> : <span className="rounded-md border border-border p-2 opacity-40"><ChevronLeft className="size-4" /></span>}<span>Page {data.page} / {data.totalPages}</span>{data.page < data.totalPages ? <Link href={pageHref(data.page + 1)} aria-label="Next page" className="rounded-md border border-border p-2"><ChevronRight className="size-4" /></Link> : <span className="rounded-md border border-border p-2 opacity-40"><ChevronRight className="size-4" /></span>}</nav>
  </main>;
}
