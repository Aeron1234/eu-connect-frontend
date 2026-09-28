"use client";

import { useMemo, useState } from "react";
import { Building2, GraduationCap, Layers, Power, Search } from "lucide-react";
import {
  activateDepartment,
  deactivateDepartment,
  activateCourse,
  deactivateCourse,
  addDepartment,
  addCourse,
} from "@/lib/server-actions/course-and-department-actions";
import SearchBar from "./SearchBar";
import PageTitle from "./PageTitle";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DepartmentsAndCoursesManager({
  initialDepartments = [],
  initialCourses = [],
}) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [courses, setCourses] = useState(initialCourses);

  const [view, setView] = useState("departments"); // "departments" | "courses"
  const [status, setStatus] = useState("all"); // "all" | "active" | "inactive"
  const [query, setQuery] = useState("");
  const [pendingIds, setPendingIds] = useState(new Set());

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
          c.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [courses, status, query]);

  async function handleToggleDepartment(dept) {
    setPendingIds((prev) => new Set(prev).add(dept.id));
    const action = dept.is_active ? deactivateDepartment : activateDepartment;
    const result = await action(dept.id);

    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(dept.id);
      return next;
    });

    if (result?.error) {
      console.error(result.error);
      return;
    }

    setDepartments((prev) =>
      prev.map((d) =>
        d.id === dept.id ? { ...d, is_active: d.is_active ? 0 : 1 } : d,
      ),
    );
  }

  async function handleToggleCourse(course) {
    setPendingIds((prev) => new Set(prev).add(course.id));
    const action = course.is_active ? deactivateCourse : activateCourse;
    const result = await action(course.id);

    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(course.id);
      return next;
    });

    if (result?.error) {
      console.error(result.error);
      return;
    }

    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id ? { ...c, is_active: c.is_active ? 0 : 1 } : c,
      ),
    );
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

      if (result?.error) {
        setDeptError(result.error);
        return;
      }

      setDepartments((prev) => [result.department, ...prev]);
      setDeptName("");
      setDeptCode("");
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

      if (result?.error) {
        setCourseError(result.error);
        return;
      }

      setCourses((prev) => [result.course, ...prev]);
      setCourseName("");
      setCourseCode("");
      setCourseDeptId("");
    } finally {
      setIsAddingCourse(false);
    }
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <PageTitle
        Icon={Layers}
        title={"Departments & Courses"}
        description={
          "Add new departments and courses, and activate or deactivate existing ones."
        }
      />

      {/* Add forms */}
      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={handleAddDepartment}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="size-4 text-primary-500" /> Add Department
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
              className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-500/90 disabled:opacity-50"
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
            <GraduationCap className="size-4 text-primary-500" /> Add Course
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
            <div className="grid grid-cols-2 gap-3">
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
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Department
                </label>
                <select
                  value={courseDeptId}
                  onChange={(e) => setCourseDeptId(e.target.value)}
                  disabled={isAddingCourse}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
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
              className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-500/90 disabled:opacity-50"
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
                    ? "bg-primary-500 text-primary-foreground"
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
                    ? "bg-primary-500 text-primary-foreground"
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
                    ? "bg-primary-500 text-primary-foreground"
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Courses</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {d.name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{d.code}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {courseCountByDept[d.id] || 0} courses
                  </td>
                  <td className="px-5 py-3">
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
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggleDepartment(d)}
                      disabled={pendingIds.has(d.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 disabled:opacity-50"
                    >
                      <Power className="size-3.5" />
                      {d.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDepartments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {c.course_name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.code}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {departmentNameById[c.department_id] || "—"}
                  </td>
                  <td className="px-5 py-3">
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
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggleCourse(c)}
                      disabled={pendingIds.has(c.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 disabled:opacity-50"
                    >
                      <Power className="size-3.5" />
                      {c.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
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
