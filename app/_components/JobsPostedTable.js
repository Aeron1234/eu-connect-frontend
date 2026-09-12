import { Briefcase, MapPin } from "lucide-react";
import Pagination from "./Pagination";

// internship_postings.work_type -> display label
const workTypeMap = {
  "on-site": "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

// internship_postings.work_type -> pill badge style
const workTypeBadgeStyles = {
  "on-site": "text-blue-600 bg-blue-50 border border-blue-200",
  hybrid: "text-purple-600 bg-purple-50 border border-purple-200",
  remote: "text-emerald-600 bg-emerald-50 border border-emerald-200",
};

export function mapJobRow(row) {
  return {
    id: row.id,
    position: row.position,
    location: row.location,
    type: workTypeMap[row.work_type] || row.work_type,
    typeKey: row.work_type,
    vacancies: row.vacancies,
    postedDate: row.created_at,
  };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function JobsPostedTable({ jobs = [], totalPages = 1, currentJobPage = 1 }) {
  const hrefPrev = `/employer?j_page=${currentJobPage - 1}`;
  const hrefNext = `/employer?j_page=${currentJobPage + 1}`;

  return (
    <section className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-4">
        <Briefcase className="w-4 h-4 text-primary-500" />
        Jobs You Posted
      </h3>
      <div className="overflow-x-auto">
        <table className="w-2xl md:w-full text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="text-left py-2 font-medium">Position</th>
              <th className="text-left py-2 font-medium">Location</th>
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-right py-2 font-medium">Vacancies</th>
              <th className="text-right py-2 font-medium">Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-stone-300 last:border-b-0"
              >
                <td className="py-3 text-stone-800 font-medium">
                  {job.position}
                </td>
                <td className="py-3">
                  <span className="flex items-center gap-1 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    {job.location}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workTypeBadgeStyles[job.typeKey] ||
                      "text-stone-600 bg-stone-100 border border-stone-200"
                    }`}
                  >
                    {job.type}
                  </span>
                </td>
                <td
                  className={`py-3 text-right font-medium ${
                    job.vacancies === 0 ? "text-blue-600" : "text-stone-800"
                  }`}
                >
                  {job.vacancies}
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  {formatDate(job.postedDate)}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-sm text-stone-600"
                >
                  No jobs posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 w-full flex justify-end text-sm text-stone-600">
        <Pagination
          hrefPrev={hrefPrev}
          hrefNext={hrefNext}
          currentPage={currentJobPage}
          totalPages={totalPages}
        />
      </div>
    </section>
  );
}

export default JobsPostedTable;
