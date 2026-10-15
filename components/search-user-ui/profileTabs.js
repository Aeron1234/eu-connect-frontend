export function buildTabs({ userRole, searchedUserRole, supervision, hasOngoingInternship }) {
  if (searchedUserRole !== "student") {
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
