import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { getCompanyEvaluationSummary } from "@/lib/server-actions/company-evaluation-summary-actions";

export const metadata = { title: "Company Evaluation Details" };

const rating = (value) => value == null ? "—" : `${Number(value).toFixed(2)} / 5`;

export default async function CompanyEvaluationDetailsPage({ params, searchParams }) {
  const { companyKey } = await params;
  const input = await searchParams;
  const filters = Object.fromEntries(["courseId", "from", "through", "sort", "page"].map((field) => [field, typeof input[field] === "string" ? input[field] : ""]));
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  const backHref = `/department_head/evaluated-companies?${query}`;
  let data;
  try { data = await getCompanyEvaluationSummary(filters, companyKey); }
  catch (error) { return <main className="p-4 sm:p-6 lg:p-8"><Link href={backHref} className="text-sm text-primary-emphasis hover:underline">Back to companies</Link><div role="alert" className="mt-5 rounded-xl border border-border bg-card p-6">{error.message}</div></main>; }
  const company = data.company;
  const courseLabel = data.courses.find((course) => String(course.id) === filters.courseId)?.course_name || "All courses";
  return <main className="min-w-0 space-y-5 p-4 sm:p-6 lg:p-8">
    <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-primary-emphasis hover:underline"><ArrowLeft className="size-4" />Back to evaluated companies</Link>
    <header className="rounded-xl border border-border bg-card p-5"><h1 className="text-2xl font-semibold">{company.companyName}</h1><p className="mt-1 text-sm text-muted-foreground">{company.companyAddress || "Address not recorded"}</p><p className="mt-2 text-xs text-muted-foreground">{courseLabel} · Internship starts {filters.from || "any date"} to {filters.through || "any date"}</p><div className="mt-3 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-1 font-semibold text-primary-emphasis"><Star className="size-4" />{rating(company.rating)}</span><span className="text-sm">{company.reviewerCount} distinct student reviewers · {company.evaluationCount} evaluations</span></div>{company.limitedFeedback && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">Limited feedback: fewer than 3 student reviewers.</p>}{company.uncertainMatch && <p className="mt-2 text-sm text-muted-foreground">Review grouping: {company.uncertainMatch}</p>}</header>
    <section className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Ratings by category</h2><div className="mt-3 flex flex-wrap gap-2">{company.categories.map((category) => <span key={category.category} className="rounded-full bg-muted px-3 py-1.5 text-sm">{category.category}: {rating(category.rating)}</span>)}</div><p className="mt-3 text-xs text-muted-foreground">Each student has equal weight. Multiple evaluations from the same student are averaged before the company rating is calculated.</p></section>
    <section className="space-y-3" aria-label="Student evaluations"><h2 className="text-lg font-semibold">Student evaluations</h2>{company.evaluations.map((evaluation) => <article key={evaluation.id} className="rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold">{evaluation.studentName}</h3><p className="text-xs text-muted-foreground">{evaluation.ownDepartment ? "Your department" : "Other department · name masked"} · {evaluation.submittedAt || "Date unavailable"}</p><p className="mt-1 text-xs text-muted-foreground">This evaluation: {rating(evaluation.rating)} · Student average for this company: {rating(evaluation.studentAverage)}</p></div><span className="font-semibold text-primary-emphasis">{rating(evaluation.rating)}</span></div><div className="mt-3 max-w-full overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase text-muted-foreground"><th className="py-2 pr-3">Category</th><th className="py-2 pr-3">Criterion</th><th className="py-2">Score</th></tr></thead><tbody>{evaluation.scores.map((score, index) => <tr key={`${evaluation.id}-${index}`} className="border-b border-border last:border-0"><td className="py-2 pr-3">{score.category}</td><td className="py-2 pr-3">{score.criterion}</td><td className="py-2 whitespace-nowrap">{score.score} / 5</td></tr>)}</tbody></table></div>{evaluation.ownDepartment && evaluation.remarks && <div className="mt-3 rounded-lg bg-muted p-3 text-sm"><p className="font-medium">Student remarks</p><p className="mt-1 whitespace-pre-wrap">{evaluation.remarks}</p></div>}</article>)}</section>
  </main>;
}
