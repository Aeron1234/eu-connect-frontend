import DepartmentsAndCoursesManager from "@/app/_components/DepartmentAndCoursesManager";
import { getCourses, getDepartments } from "@/app/_services/services";

export const metadata = {
  title: "Departments & Courses",
};

async function DepartmentsAndCoursesPage() {
  const [courses, departments] = await Promise.all([
    getCourses(),
    getDepartments(),
  ]);

  return (
    <DepartmentsAndCoursesManager
      initialCourses={courses}
      initialDepartments={departments}
    />
  );
}

export default DepartmentsAndCoursesPage;
