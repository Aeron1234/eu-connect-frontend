"use client";

import { useMemo, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isStudentAtRisk } from "@/lib/internshipRisk";
import ProgressBar from "../ui/ProgressBar";

function StudentHoursTracker({ students = [], courses = [] }) {
  const [courseFilter, setCourseFilter] = useState("all");

  const filteredStudents = useMemo(() => {
    if (courseFilter === "all") return students;
    return students.filter((s) => s.course === courseFilter);
  }, [students, courseFilter]);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6 h-full">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="w-4 h-4 text-primary-emphasis" />
            Student Hours Tracker
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Individual hours progress of all active interns
          </p>
        </div>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs px-2">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Courses
            </SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.short_name} className="text-xs">
                {c.short_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {filteredStudents.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No students in this course.
          </p>
        ) : (
          filteredStudents.map((s) => {
            const pct = Math.round((s.accumulated_hours / s.total_hours) * 100);
            const atRisk = isStudentAtRisk(s);

            return (
              <div
                key={s.id}
                className="rounded-lg border border-border p-3 sm:p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {s.name}
                      </p>
                      <span className="rounded-full bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-foreground-soft">
                        {s.course}
                      </span>
                      {atRisk && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          At risk
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.company}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ProgressBar
                      value={pct}
                      label={`${s.name} internship hours completed`}
                      className="w-28 sm:w-36"
                    />
                    <span className="text-xs font-semibold text-foreground w-9 text-right">
                      {pct}%
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {s.accumulated_hours}/{s.total_hours}h
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudentHoursTracker;
