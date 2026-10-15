"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, GraduationCap, Layers, Pencil, Power } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorUI from "@/components/ui/ErrorUI";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  adminCoursesOptions,
  adminDepartmentsOptions,
  departmentCourseKeys,
} from "@/lib/cache/department-course-queries";
import { Skeleton } from "@/components/ui/skeleton";
import { accountFormKeys } from "@/lib/cache/account-form-queries";
import { referenceKeys } from "@/lib/cache/reference-queries";
import {
  activateDepartment,
  deactivateDepartment,
  activateCourse,
  deactivateCourse,
  addDepartment,
  addCourse,
  updateDepartment,
  updateCourse,
} from "@/lib/server-actions/course-and-department-actions";
import SearchBar from "../ui/SearchBar";
import PageTitle from "../ui/PageTitle";
import PageManual from "../ui/PageManual";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const EMPTY_LIST = [];

function LoadingRows() {
  return Array.from({ length: 4 }, (_, index) => (
    <tr key={index} className="border-b border-border last:border-0 max-2xl:block max-2xl:rounded-xl max-2xl:border max-2xl:bg-card max-2xl:shadow-sm">
      <td colSpan={5} className="px-5 py-3 max-2xl:block max-2xl:p-4">
        <Skeleton className="h-5 w-full max-2xl:mb-3" />
        <Skeleton className="hidden h-4 w-2/3 max-2xl:block" />
      </td>
    </tr>
  ));
}

export default function DepartmentsAndCoursesManager({ currentUserId = "" }) {
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

  const visibleQuery = view === "departments" ? departmentsQuery : coursesQuery;
  if (visibleQuery.isError && !visibleQuery.data) {
    return <ErrorUI error={visibleQuery.error} reset={() => void visibleQuery.refetch()} logError={false} />;
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <ConfirmDialog open={Boolean(confirmDepartment)} onOpenChange={(open) => { if (!open) setConfirmDepartment(null); }} title="Deactivate department?" description={confirmDepartment ? `Deactivate ${confirmDepartment.name}? Its courses will no longer be offered for new selections.` : ""} confirmLabel="Deactivate" destructive pending={Boolean(confirmDepartment && pendingIds.has(`department:${confirmDepartment.id}`))} onConfirm={async () => { if (!confirmDepartment) return; await handleToggleDepartment(confirmDepartment); setConfirmDepartment(null); }} />
      <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open && !isSavingEdit) { setEditing(null); setEditError(""); } }}>
        <DialogContent className="max-w-md p-4 sm:p-6">
          <DialogHeader className="text-left"><DialogTitle>Edit {editing?.kind === "course" ? "course" : "department"}</DialogTitle><DialogDescription>Update the name, code, and department where applicable.</DialogDescription></DialogHeader>
          {editing && <form onSubmit={handleEdit} className="space-y-4">
            <label className="block text-sm font-medium">Name<input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} disabled={isSavingEdit} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3" /></label>
            <label className="block text-sm font-medium">Code<input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} disabled={isSavingEdit} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3" /></label>
            {editing.kind === "course" && <div className="text-sm font-medium"><span id="edit-course-department">Department</span><Select value={editing.departmentId} onValueChange={(value) => setEditing({ ...editing, departmentId: value })} disabled={isSavingEdit}><SelectTrigger aria-labelledby="edit-course-department" className="mt-1 h-10 w-full bg-background px-3"><SelectValue /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.code} — {d.name}</SelectItem>)}</SelectContent></Select></div>}
            {editError && <p role="alert" className="text-sm text-destructive">{editError}</p>}
            <DialogFooter><button type="button" onClick={() => setEditing(null)} disabled={isSavingEdit} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={isSavingEdit} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{isSavingEdit ? "Saving..." : "Save changes"}</button></DialogFooter>
          </form>}
        </DialogContent>
      </Dialog>
      <PageTitle
        Icon={Layers}
        title={"Departments & Courses"}
        description={
          "Add new departments and courses, and activate or deactivate existing ones."
        }
        titleAction={<PageManual page="admin-departments" />}
      />

      {/* Add forms */}
      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={handleAddDepartment}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="size-4 text-primary-emphasis" /> Add
            Department
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Department Name
              </label>
              <input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="College of Computer Studies"
                disabled={isAddingDept}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Code
              </label>
              <input
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                placeholder="CCS"
                disabled={isAddingDept}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
              />
            </div>
            {deptError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {deptError}
              </p>
            )}
            <button
              type="submit"
              disabled={isAddingDept}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isAddingDept ? "Adding..." : "+ Add Department"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleAddCourse}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <GraduationCap className="size-4 text-primary-emphasis" /> Add
            Course
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Course Name
              </label>
              <input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="BS Computer Science"
                disabled={isAddingCourse}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Code
                </label>
                <input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="BSCS"
                  disabled={isAddingCourse}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
                />
              </div>
              <div>
                <label
                  htmlFor="course-department"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Department
                </label>
                <Select
                  value={courseDeptId}
                  onValueChange={setCourseDeptId}
                  disabled={isAddingCourse}
                >
                  <SelectTrigger
                    id="course-department"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {departments.filter((d) => d.is_active).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.code} — {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {courseError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {courseError}
              </p>
            )}
            <button
              type="submit"
              disabled={isAddingCourse}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isAddingCourse ? "Adding..." : "+ Add Course"}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-row sm:flex-col gap-3 justify-between ">
          <div className="flex flex-wrap-reverse items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setView("departments")}
                className={cx(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "departments"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                Departments ({departments.length})
              </button>
              <button
                type="button"
                onClick={() => setView("courses")}
                className={cx(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "courses"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                Courses ({courses.length})
              </button>
            </div>

            <SearchBar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search departments or courses by name or code..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {["all", "active", "inactive"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cx(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {view === "departments" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm max-2xl:overflow-visible max-2xl:border-0 max-2xl:bg-transparent max-2xl:shadow-none">
          <table className="w-full text-sm max-2xl:block">
            <thead className="max-2xl:hidden">
              <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Courses</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="max-2xl:grid max-2xl:gap-3 lg:max-2xl:grid-cols-2">
              {departmentsQuery.isPending ? (
                <LoadingRows />
              ) : filteredDepartments.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 max-2xl:grid max-2xl:min-w-0 max-2xl:grid-cols-2 max-2xl:gap-x-3 max-2xl:gap-y-4 max-2xl:rounded-xl max-2xl:border max-2xl:bg-card max-2xl:p-4 max-2xl:shadow-sm">
                  <td className="px-5 py-3 font-medium text-foreground max-2xl:col-span-2 max-2xl:p-0 max-2xl:text-base max-2xl:leading-snug">
                    {d.name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-2xl:p-0 max-2xl:text-foreground">
                    <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Code</span>
                    {d.code}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-2xl:p-0 max-2xl:text-foreground">
                    <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Courses</span>
                    {courseCountByDept[d.id] || 0} courses
                  </td>
                  <td className="px-5 py-3 max-2xl:col-span-2 max-2xl:p-0">
                    <span className="mr-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Status</span>
                    <span
                      className={cx(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        d.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right max-2xl:col-span-2 max-2xl:flex max-2xl:gap-2 max-2xl:border-t max-2xl:border-border max-2xl:p-0 max-2xl:pt-3">
                    <button type="button" onClick={() => { setEditError(""); setEditing({ kind: "department", id: d.id, name: d.name, code: d.code }); }} className="mr-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium max-2xl:mr-0 max-2xl:min-h-9 max-2xl:flex-1 max-2xl:justify-center"><Pencil className="size-3.5" /> Edit</button>
                    <button
                      type="button"
                      onClick={() => d.is_active ? setConfirmDepartment(d) : handleToggleDepartment(d)}
                      disabled={pendingIds.has(`department:${d.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 disabled:opacity-50 max-2xl:min-h-9 max-2xl:flex-1 max-2xl:justify-center"
                    >
                      <Power className="size-3.5" />
                      {d.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {!departmentsQuery.isPending && (departmentsQuery.data || !departmentsQuery.isError) && filteredDepartments.length === 0 && (
                <tr className="max-2xl:col-span-full max-2xl:block max-2xl:rounded-xl max-2xl:border max-2xl:border-border max-2xl:bg-card">
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-muted-foreground max-2xl:block"
                  >
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm max-2xl:overflow-visible max-2xl:border-0 max-2xl:bg-transparent max-2xl:shadow-none">
          <table className="w-full text-sm max-2xl:block">
            <thead className="max-2xl:hidden">
              <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="max-2xl:grid max-2xl:gap-3 lg:max-2xl:grid-cols-2">
              {coursesQuery.isPending ? (
                <LoadingRows />
              ) : filteredCourses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 max-2xl:grid max-2xl:min-w-0 max-2xl:grid-cols-2 max-2xl:gap-x-3 max-2xl:gap-y-4 max-2xl:rounded-xl max-2xl:border max-2xl:bg-card max-2xl:p-4 max-2xl:shadow-sm">
                  <td className="px-5 py-3 font-medium text-foreground max-2xl:col-span-2 max-2xl:p-0 max-2xl:text-base max-2xl:leading-snug">
                    {c.course_name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-2xl:p-0 max-2xl:text-foreground">
                    <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Code</span>
                    {c.code || c.short_name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-2xl:min-w-0 max-2xl:break-words max-2xl:p-0 max-2xl:text-foreground">
                    <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Department</span>
                    {departmentNameById[c.department_id] || "—"}
                  </td>
                  <td className="px-5 py-3 max-2xl:col-span-2 max-2xl:p-0">
                    <span className="mr-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground 2xl:hidden">Status</span>
                    <span
                      className={cx(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        c.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right max-2xl:col-span-2 max-2xl:flex max-2xl:gap-2 max-2xl:border-t max-2xl:border-border max-2xl:p-0 max-2xl:pt-3">
                    <button type="button" onClick={() => { setEditError(""); setEditing({ kind: "course", id: c.id, name: c.course_name, code: c.short_name || c.code || "", departmentId: String(c.department_id) }); }} className="mr-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium max-2xl:mr-0 max-2xl:min-h-9 max-2xl:flex-1 max-2xl:justify-center"><Pencil className="size-3.5" /> Edit</button>
                    <button
                      type="button"
                      onClick={() => handleToggleCourse(c)}
                      disabled={pendingIds.has(`course:${c.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 disabled:opacity-50 max-2xl:min-h-9 max-2xl:flex-1 max-2xl:justify-center"
                    >
                      <Power className="size-3.5" />
                      {c.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {!coursesQuery.isPending && (coursesQuery.data || !coursesQuery.isError) && filteredCourses.length === 0 && (
                <tr className="max-2xl:col-span-full max-2xl:block max-2xl:rounded-xl max-2xl:border max-2xl:border-border max-2xl:bg-card">
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-muted-foreground max-2xl:block"
                  >
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
