import { withReadErrorPage } from "@/lib/page-read-error";
import DepartmentsAndCoursesManager from "@/components/departments-and-courses-ui/DepartmentAndCoursesManager";
import {
  getCourses,
  getDepartments,
} from "@/lib/server-actions/course-and-department-actions";

export const metadata = {
  title: "Departments & Courses",
};

export const dynamic = "force-dynamic";

async function DepartmentsAndCoursesPage() {
  const [courses, departments] = await Promise.all([
    getCourses(),
    getDepartments(),
  ]);

  return (
    <DepartmentsAndCoursesManager
      initialCourses={courses || []}
      initialDepartments={departments || []}
    />
  );
}

export default withReadErrorPage(DepartmentsAndCoursesPage);
