"use client";

import { Layers } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorUI from "@/components/ui/ErrorUI";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import DepartmentForm from "./DepartmentForm";
import CourseForm from "./CourseForm";
import DepartmentCourseFilters from "./DepartmentCourseFilters";
import DepartmentCourseEditDialog from "./DepartmentCourseEditDialog";
import { DepartmentsTable, CoursesTable } from "./DepartmentCourseTables";
import useDepartmentCoursesManager from "./useDepartmentCoursesManager";

export default function DepartmentsAndCoursesManager({ currentUserId = "" }) {
  const manager = useDepartmentCoursesManager(currentUserId);
  const visibleQuery = manager.view === "departments" ? manager.departmentsQuery : manager.coursesQuery;
  if (visibleQuery.isError && !visibleQuery.data) {
    return <ErrorUI error={visibleQuery.error} reset={() => void visibleQuery.refetch()} logError={false} />;
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <ConfirmDialog
        {...manager.confirmation}
        title="Deactivate department?"
        confirmLabel="Deactivate"
        destructive
      />
      <DepartmentCourseEditDialog {...manager.editDialog} />
      <PageTitle
        Icon={Layers}
        title={"Departments & Courses"}
        description={
          "Add new departments and courses, and activate or deactivate existing ones."
        }
        titleAction={<PageManual page="admin-departments" />}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <DepartmentForm {...manager.departmentForm} />
        <CourseForm {...manager.courseForm} />
      </div>
      <DepartmentCourseFilters {...manager.filters} />
      {manager.view === "departments" ? (
        <DepartmentsTable {...manager.departmentTable} />
      ) : (
        <CoursesTable {...manager.courseTable} />
      )}
    </main>
  );
}
