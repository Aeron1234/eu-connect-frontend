import studentGuides from "./guides/studentGuides";
import employerGuides from "./guides/employerGuides";
import departmentHeadGuides from "./guides/departmentHeadGuides";
import adminGuides from "./guides/adminGuides";
import sharedGuides from "./guides/sharedGuides";

export const roleNames = { student: "Student", employer: "Employer", department_head: "Department Head", admin: "Administrator" };
export const roleGuides = { student: studentGuides, employer: employerGuides, department_head: departmentHeadGuides, admin: adminGuides };
export { sharedGuides };

// Help and page manuals must apply the same role and registrar visibility rules.
export function getHelpSections(user) {
  const role = user?.role;
  if (!roleGuides[role]) return [];
  const isRegistrar = role === "department_head" && user?.department_code === "REG";
  const visible = guide =>
    (!guide.onlyRegistrar || isRegistrar) &&
    (!guide.hideForRegistrar || !isRegistrar) &&
    (!guide.studentOnly || role === "student") &&
    (!guide.hideForEmployer || role !== "employer");
  return [
    { title: `${roleNames[role]} guides`, guides: roleGuides[role].filter(visible) },
    { title: "Shared tools and account", guides: sharedGuides.filter(visible) },
  ];
}

// Page manuals search the same filtered sections as Help, so a known guide ID
// cannot bypass role/registrar visibility.
export function getPageGuide(user, id) {
  return getHelpSections(user).flatMap(section => section.guides).find(guide => guide.id === id);
}
