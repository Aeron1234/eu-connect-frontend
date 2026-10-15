"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminCoursesOptions,
  adminDepartmentsOptions,
  departmentCourseKeys,
} from "@/lib/cache/department-course-queries";
import { accountFormKeys } from "@/lib/cache/account-form-queries";
import { referenceKeys } from "@/lib/cache/reference-queries";
import {
  activateDepartment, deactivateDepartment, activateCourse, deactivateCourse,
  addDepartment, addCourse, updateDepartment, updateCourse,
} from "@/lib/server-actions/course-and-department-actions";

const EMPTY_LIST = [];

export default function useDepartmentCoursesManager(currentUserId) {
  const queryClient = useQueryClient();
  const departmentsQuery = useQuery({
    ...adminDepartmentsOptions(currentUserId),
    enabled: Boolean(currentUserId),
  });
  const coursesQuery = useQuery({
    ...adminCoursesOptions(currentUserId),
    enabled: Boolean(currentUserId),
  });
  const departments = departmentsQuery.data ?? EMPTY_LIST;
  const courses = coursesQuery.data ?? EMPTY_LIST;

  const [view, setView] = useState("departments"); // "departments" | "courses"
  const [status, setStatus] = useState("all"); // "all" | "active" | "inactive"
  const [query, setQuery] = useState("");
  const [pendingIds, setPendingIds] = useState(new Set());
  const [confirmDepartment, setConfirmDepartment] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add Department form state
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptError, setDeptError] = useState("");
  const [isAddingDept, setIsAddingDept] = useState(false);

  // Add Course form state
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDeptId, setCourseDeptId] = useState("");
  const [courseError, setCourseError] = useState("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  const courseCountByDept = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      map[c.department_id] = (map[c.department_id] || 0) + 1;
    });
    return map;
  }, [courses]);

  const departmentNameById = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (status === "active" && !d.is_active) return false;
      if (status === "inactive" && d.is_active) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [departments, status, query]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (status === "active" && !c.is_active) return false;
      if (status === "inactive" && c.is_active) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          c.course_name.toLowerCase().includes(q) ||
          (c.code || c.short_name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [courses, status, query]);

  async function handleToggleDepartment(dept) {
    const pendingKey = `department:${dept.id}`;
    setPendingIds((prev) => new Set(prev).add(pendingKey));
    try {
      const action = dept.is_active ? deactivateDepartment : activateDepartment;
      const result = await action(dept.id);
      if (!result?.success) {
        toast.error(result?.error || "Could not update department.");
        return;
      }
      queryClient.setQueryData(departmentCourseKeys.departments(currentUserId), (list) =>
        list?.map((item) =>
          item.id === dept.id ? { ...item, is_active: dept.is_active ? 0 : 1 } : item,
        ),
      );
      void queryClient.invalidateQueries({
        queryKey: departmentCourseKeys.departments(currentUserId),
      });
      void queryClient.invalidateQueries({ queryKey: accountFormKeys.data(currentUserId) });
      void queryClient.invalidateQueries({ queryKey: referenceKeys.courses(currentUserId) });
    } catch {
      toast.error("Could not update department.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(pendingKey);
        return next;
      });
    }
  }

  async function handleToggleCourse(course) {
    const pendingKey = `course:${course.id}`;
    setPendingIds((prev) => new Set(prev).add(pendingKey));
    try {
      const action = course.is_active ? deactivateCourse : activateCourse;
      const result = await action(course.id);
      if (!result?.success) {
        toast.error(result?.error || "Could not update course.");
        return;
      }
      queryClient.setQueryData(departmentCourseKeys.courses(currentUserId), (list) =>
        list?.map((item) =>
          item.id === course.id ? { ...item, is_active: course.is_active ? 0 : 1 } : item,
        ),
      );
      void queryClient.invalidateQueries({
        queryKey: departmentCourseKeys.courses(currentUserId),
      });
      void queryClient.invalidateQueries({ queryKey: accountFormKeys.data(currentUserId) });
      void queryClient.invalidateQueries({ queryKey: referenceKeys.courses(currentUserId) });
    } catch {
      toast.error("Could not update course.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(pendingKey);
        return next;
      });
    }
  }

  async function handleAddDepartment(e) {
    e.preventDefault();
    setDeptError("");

    if (!deptName.trim() || !deptCode.trim()) {
      setDeptError("Both name and code are required.");
      return;
    }

    setIsAddingDept(true);
    try {
      const result = await addDepartment({ name: deptName, code: deptCode });

      if (!result?.success || !result.department) {
        setDeptError(result?.error || "Could not add department.");
        return;
      }

      queryClient.setQueryData(departmentCourseKeys.departments(currentUserId), (list) =>
        list ? [result.department, ...list] : [result.department],
      );
      void queryClient.invalidateQueries({
        queryKey: departmentCourseKeys.departments(currentUserId),
      });
      void queryClient.invalidateQueries({ queryKey: accountFormKeys.data(currentUserId) });
      void queryClient.invalidateQueries({ queryKey: referenceKeys.courses(currentUserId) });
      setDeptName("");
      setDeptCode("");
    } catch {
      setDeptError("Could not add department.");
    } finally {
      setIsAddingDept(false);
    }
  }

  async function handleAddCourse(e) {
    e.preventDefault();
    setCourseError("");

    if (!courseName.trim() || !courseCode.trim() || !courseDeptId) {
      setCourseError("Course name, code, and department are all required.");
      return;
    }

    setIsAddingCourse(true);
    try {
      const result = await addCourse({
        course_name: courseName,
        short_name: courseCode,
        department_id: courseDeptId,
      });

      if (!result?.success || !result.course) {
        setCourseError(result?.error || "Could not add course.");
        return;
      }

      queryClient.setQueryData(departmentCourseKeys.courses(currentUserId), (list) =>
        list ? [result.course, ...list] : [result.course],
      );
      void queryClient.invalidateQueries({
        queryKey: departmentCourseKeys.courses(currentUserId),
      });
      void queryClient.invalidateQueries({ queryKey: accountFormKeys.data(currentUserId) });
      void queryClient.invalidateQueries({ queryKey: referenceKeys.courses(currentUserId) });
      setCourseName("");
      setCourseCode("");
      setCourseDeptId("");
    } catch {
      setCourseError("Could not add course.");
    } finally {
      setIsAddingCourse(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editing || isSavingEdit) return;
    const name = editing.name.trim();
    const code = editing.code.trim();
    if (!name || !code || (editing.kind === "course" && !editing.departmentId)) {
      setEditError("Complete all fields before saving.");
      return;
    }
    setIsSavingEdit(true);
    setEditError("");
    try {
      const result = editing.kind === "department"
        ? await updateDepartment(editing.id, { name, code })
        : await updateCourse(editing.id, { course_name: name, short_name: code, department_id: editing.departmentId });
      const updated = editing.kind === "department" ? result?.department : result?.course;
      if (!result?.success || !updated) {
        setEditError(result?.error || "Could not save changes.");
        return;
      }
      const key = editing.kind === "department" ? departmentCourseKeys.departments(currentUserId) : departmentCourseKeys.courses(currentUserId);
      queryClient.setQueryData(key, (list) => list?.map((item) => item.id === editing.id ? updated : item));
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: accountFormKeys.data(currentUserId) });
      void queryClient.invalidateQueries({ queryKey: referenceKeys.courses(currentUserId) });
      setEditing(null);
      toast.success(`${editing.kind === "department" ? "Department" : "Course"} updated.`);
    } catch {
      setEditError("Could not save changes.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  return {
    view,
    departmentsQuery,
    coursesQuery,
    departmentForm: {
      deptName, setDeptName, deptCode, setDeptCode,
      deptError, isAddingDept, handleAddDepartment,
    },
    courseForm: {
      courseName, setCourseName, courseCode, setCourseCode,
      courseDeptId, setCourseDeptId, courseError, isAddingCourse,
      handleAddCourse, departments,
    },
    editDialog: {
      editing, setEditing, editError, setEditError,
      isSavingEdit, handleEdit, departments,
    },
    filters: {
      view, setView, status, setStatus,
      query, setQuery, departments, courses,
    },
    confirmation: {
      open: Boolean(confirmDepartment),
      onOpenChange: (open) => {
        if (!open) setConfirmDepartment(null);
      },
      description: confirmDepartment
        ? `Deactivate ${confirmDepartment.name}? Its courses will no longer be offered for new selections.`
        : "",
      pending: Boolean(
        confirmDepartment && pendingIds.has(`department:${confirmDepartment.id}`),
      ),
      onConfirm: async () => {
        if (!confirmDepartment) return;
        await handleToggleDepartment(confirmDepartment);
        setConfirmDepartment(null);
      },
    },
    departmentTable: {
      departments: filteredDepartments,
      isPending: departmentsQuery.isPending,
      showEmpty: Boolean(departmentsQuery.data || !departmentsQuery.isError),
      courseCountByDept,
      pendingIds,
      onEdit: (d) => {
        setEditError("");
        setEditing({ kind: "department", id: d.id, name: d.name, code: d.code });
      },
      onToggle: (d) => d.is_active ? setConfirmDepartment(d) : handleToggleDepartment(d),
    },
    courseTable: {
      courses: filteredCourses,
      isPending: coursesQuery.isPending,
      showEmpty: Boolean(coursesQuery.data || !coursesQuery.isError),
      departmentNameById,
      pendingIds,
      onEdit: (c) => {
        setEditError("");
        setEditing({
          kind: "course",
          id: c.id,
          name: c.course_name,
          code: c.short_name || c.code || "",
          departmentId: String(c.department_id),
        });
      },
      onToggle: handleToggleCourse,
    },
  };
}
