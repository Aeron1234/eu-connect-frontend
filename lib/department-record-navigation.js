const submissionTabs = new Set(["narratives", "summary-report", "documents"]);

// Preserve old record-tab bookmarks after review work moves to task pages.
export function departmentRecordDestination(internshipId, query = {}) {
  const id = encodeURIComponent(internshipId);
  if (query.tab === "dtr") return `/department_head/attendance/${id}`;
  if (submissionTabs.has(query.tab)) return `/department_head/submissions/${id}?tab=${query.tab}`;
  if (query.tab === "evaluations") {
    const focus = typeof query.evaluationId === "string" && query.evaluationId
      ? `?evaluationId=${encodeURIComponent(query.evaluationId)}` : "";
    return `/department_head/evaluations/${id}${focus}`;
  }
  if (query.tab === "rotations") return `/department_head/internship-records/${id}?tab=rotations`;
  return `/department_head/internship-records/${id}`;
}
