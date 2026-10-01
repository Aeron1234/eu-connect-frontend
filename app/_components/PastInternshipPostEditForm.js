"use client";

import { useState } from "react";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputClass =
  "mt-1 px-3 py-2 border border-border bg-card rounded-md text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const selectTriggerClass =
  "mt-1 flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm shadow-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function PastInternshipPostEditForm({
  handleAction,
  isPending = false,
  type = "create",
  data = {},
  courses = [],
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(
    type === "edit" && data.course_id ? String(data.course_id) : "",
  );

  return (
    <form action={handleAction} className="flex-1 flex flex-col gap-6">
      {/* Required fields */}
      <div className="rounded-xl border border-border bg-muted/50 p-4 sm:p-5">
        <SectionLabel>Required Information</SectionLabel>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 max-sm:flex-col">
            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">
                Alumni Name
              </span>
              <input
                type="text"
                name="alumni_name"
                placeholder="e.g. Marco Polo"
                className={inputClass}
                defaultValue={type === "edit" ? data.alumni_name : ""}
                disabled={isPending}
                maxLength={150}
                required
              />
            </label>

            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">
                Company Name
              </span>
              <input
                type="text"
                name="company_name"
                placeholder="e.g. Accenture Philippines"
                className={inputClass}
                defaultValue={type === "edit" ? data.company_name : ""}
                disabled={isPending}
                maxLength={250}
                required
              />
            </label>
          </div>

          <div className="flex gap-4 max-sm:flex-col">
            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">
                Industry
              </span>
              <input
                type="text"
                name="industry"
                placeholder="e.g. IT-BPM"
                className={inputClass}
                defaultValue={type === "edit" ? data.industry : ""}
                disabled={isPending}
                maxLength={150}
                required
              />
            </label>

            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">Course</span>

              <input
                type="hidden"
                name="course_id"
                value={selectedCourseId}
                disabled={isPending}
              />
              <Select
                onValueChange={setSelectedCourseId}
                defaultValue={
                  type === "edit" && data.course_id
                    ? String(data.course_id)
                    : undefined
                }
                disabled={isPending}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Courses</SelectLabel>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.course_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium text-foreground-soft">
              Company Address
            </span>
            <input
              type="text"
              name="company_address"
              placeholder="e.g. Makati City"
              className={inputClass}
              defaultValue={type === "edit" ? data.company_address : ""}
              disabled={isPending}
              maxLength={255}
              required
            />
          </label>

          <div className="flex gap-4 max-sm:flex-col">
            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">
                Batch Year
              </span>
              <input
                type="number"
                name="batch_year"
                placeholder="e.g. 2026"
                className={inputClass}
                defaultValue={type === "edit" ? data.batch_year : ""}
                disabled={isPending}
                min={2000}
                max={2100}
                required
              />
            </label>

            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">
                Academic Year
              </span>
              <input
                type="text"
                name="academic_year"
                placeholder="e.g. 2025-2026"
                className={inputClass}
                defaultValue={type === "edit" ? data.academic_year : ""}
                disabled={isPending}
                maxLength={9}
                pattern="\d{4}-\d{4}"
                title="Format: YYYY-YYYY"
                required
              />
            </label>
          </div>
        </div>
      </div>

      {/* Optional fields */}
      <div className="rounded-xl border border-dashed border-border p-4 sm:p-5">
        <SectionLabel>Optional Information</SectionLabel>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-medium text-foreground-soft">
              Internship Position
            </span>
            <input
              type="text"
              name="internship_position"
              placeholder="e.g. Software Engineering Intern"
              className={inputClass}
              defaultValue={type === "edit" ? data.internship_position : ""}
              disabled={isPending}
              maxLength={150}
            />
          </label>

          <div className="flex gap-4 max-sm:flex-col">
            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">
                Total Hours
              </span>
              <input
                type="number"
                name="total_hours"
                placeholder="e.g. 486"
                className={inputClass}
                defaultValue={type === "edit" ? data.total_hours : ""}
                disabled={isPending}
                min={1}
                step="0.01"
              />
            </label>

            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground-soft">
                Accumulated Hours
              </span>
              <input
                type="number"
                name="accumulated_hours"
                placeholder="e.g. 486"
                className={inputClass}
                defaultValue={type === "edit" ? data.accumulated_hours : ""}
                disabled={isPending}
                min={0}
                step="0.01"
              />
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium text-foreground-soft">
              Supervisor Name
            </span>
            <input
              type="text"
              name="supervisor_name"
              placeholder="e.g. Nico Robin"
              className={inputClass}
              defaultValue={type === "edit" ? data.supervisor_name : ""}
              disabled={isPending}
              maxLength={150}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium text-foreground-soft">Notes</span>
            <textarea
              name="notes"
              placeholder="e.g. Completed with strong performance in leadership."
              className={`${inputClass} min-h-24 resize-none`}
              defaultValue={type === "edit" ? data.notes : ""}
              disabled={isPending}
              maxLength={2000}
            />
          </label>
        </div>
      </div>

      <DialogFooter>
        <div className="flex gap-2 font-medium w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="w-fit" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={`bg-primary hover:bg-primary-600 w-fit ${isPending ? "pointer-events-none opacity-50" : ""}`}
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className="size-6 stroke-3 stroke-primary-50" />
              ) : type === "edit" ? (
                "Save Changes"
              ) : (
                "Post Record"
              )}
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

export default PastInternshipPostEditForm;
