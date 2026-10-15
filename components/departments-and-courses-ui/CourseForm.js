"use client";

import { GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CourseForm({
  courseName, setCourseName, courseCode, setCourseCode,
  courseDeptId, setCourseDeptId, courseError, isAddingCourse,
  handleAddCourse, departments,
}) {
  return (
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
        >
          {isAddingCourse ? "Adding..." : "+ Add Course"}
        </button>
      </div>
    </form>
  );
}
