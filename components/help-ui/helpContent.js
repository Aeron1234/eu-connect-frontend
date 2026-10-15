import studentGuides from "./guides/studentGuides";
import employerGuides from "./guides/employerGuides";
import departmentHeadGuides from "./guides/departmentHeadGuides";
import adminGuides from "./guides/adminGuides";
import sharedGuides from "./guides/sharedGuides";

export const roleNames = {
  student: "Student",
  employer: "Employer",
  department_head: "Department Head",
  admin: "Administrator",
};

export const roleGuides = {
  student: studentGuides,
  employer: employerGuides,
  department_head: departmentHeadGuides,
  admin: adminGuides,
};

export { sharedGuides };
