import { withReadErrorPage } from "@/lib/page-read-error";
import DepartmentsAndCoursesManager from "@/components/departments-and-courses-ui/DepartmentAndCoursesManager";
import { getUserSession } from "@/lib/server-actions/auth";

export const metadata = {
  title: "Departments & Courses",
};

export const dynamic = "force-dynamic";

async function DepartmentsAndCoursesPage() {
  const session = await getUserSession();

  return (
    <DepartmentsAndCoursesManager
      currentUserId={session?.user?.id || ""}
    />
  );
}

export default withReadErrorPage(DepartmentsAndCoursesPage);
