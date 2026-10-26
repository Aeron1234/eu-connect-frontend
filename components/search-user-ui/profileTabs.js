// Only student targets with an ongoing internship can expose record tabs. Heads
// need explicit department permission; employers need accepted supervision.
// These display rules supplement the APIs' authorization checks.
export function buildTabs({ userRole, searchedUserRole, supervision, hasOngoingInternship, canViewStudentRecords }) {
  if (searchedUserRole !== "student") {
    return [{ value: "info", text: "Info" }];
  }
  if (userRole === "department_head" && canViewStudentRecords !== true) {
    return [{ value: "info", text: "Info" }];
  }
  if (!hasOngoingInternship) {
    return [{ value: "info", text: "Info" }];
  }
  if (userRole === "student") {
    return [{ value: "info", text: "Info" }];
  }
  if (userRole === "employer") {
    if (supervision?.status !== "accepted") {
      return [{ value: "info", text: "Info" }];
    }
    return [
      { value: "dtr", text: "DTR" },
      { value: "narratives", text: "Narratives" },
      { value: "evaluations", text: "Evaluations" },
      { value: "certificates", text: "Certificates" },
      { value: "info", text: "Info" },
    ];
  }
  return [
    { value: "dtr", text: "DTR" },
    { value: "narratives", text: "Narratives" },
    { value: "evaluations", text: "Evaluations" },
    { value: "info", text: "Info" },
  ];
}
