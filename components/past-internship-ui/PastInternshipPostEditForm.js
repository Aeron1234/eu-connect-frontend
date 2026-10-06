"use client";

import { useState } from "react";
import ModalForm, { controlClass } from "@/components/ui/ModalForm";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <ModalForm.Root action={handleAction}>
      {/* Required fields */}
      <ModalForm.Section title="Required Information">
        <div className="flex gap-2.5 max-sm:flex-col sm:gap-4">
          <label className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Alumni Name
            </span>
            <ModalForm.Input
              type="text"
              name="alumni_name"
              placeholder="e.g. Marco Polo"
              defaultValue={type === "edit" ? data.alumni_name : ""}
              disabled={isPending}
              maxLength={150}
              required
            />
          </label>

          <label className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Company Name
            </span>
            <ModalForm.Input
              type="text"
              name="company_name"
              placeholder="e.g. Accenture Philippines"
              defaultValue={type === "edit" ? data.company_name : ""}
              disabled={isPending}
              maxLength={250}
              required
            />
          </label>
        </div>

        <div className="flex gap-2.5 max-sm:flex-col sm:gap-4">
          <label className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Industry
            </span>
            <ModalForm.Input
              type="text"
              name="industry"
              placeholder="e.g. IT-BPM"
              defaultValue={type === "edit" ? data.industry : ""}
              disabled={isPending}
              maxLength={150}
              required
            />
          </label>

          <div className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Course
            </span>

            <ModalForm.Input
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
              <SelectTrigger className={controlClass}>
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
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">
            Company Address
          </span>
          <ModalForm.Input
            type="text"
            name="company_address"
            placeholder="e.g. Makati City"
            defaultValue={type === "edit" ? data.company_address : ""}
            disabled={isPending}
            maxLength={255}
            required
          />
        </label>

        <div className="flex gap-2.5 max-sm:flex-col sm:gap-4">
          <label className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Batch Year
            </span>
            <ModalForm.Input
              type="number"
              name="batch_year"
              placeholder="e.g. 2026"
              defaultValue={type === "edit" ? data.batch_year : ""}
              disabled={isPending}
              min={2000}
              max={2100}
              required
            />
          </label>

          <label className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Academic Year
            </span>
            <ModalForm.Input
              type="text"
              name="academic_year"
              placeholder="e.g. 2025-2026"
              defaultValue={type === "edit" ? data.academic_year : ""}
              disabled={isPending}
              maxLength={9}
              pattern="\d{4}-\d{4}"
              title="Format: YYYY-YYYY"
              required
            />
          </label>
        </div>
      </ModalForm.Section>

      {/* Optional fields */}
      <ModalForm.Section optional title="Optional Information">
        <label className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">
            Internship Position
          </span>
          <ModalForm.Input
            type="text"
            name="internship_position"
            placeholder="e.g. Software Engineering Intern"
            defaultValue={type === "edit" ? data.internship_position : ""}
            disabled={isPending}
            maxLength={150}
          />
        </label>

        <div className="flex gap-2.5 max-sm:flex-col sm:gap-4">
          <label className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Total Hours
            </span>
            <ModalForm.Input
              type="number"
              name="total_hours"
              placeholder="e.g. 486"
              defaultValue={type === "edit" ? data.total_hours : ""}
              disabled={isPending}
              min={1}
              step="0.01"
            />
          </label>

          <label className="flex flex-col flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Accumulated Hours
            </span>
            <ModalForm.Input
              type="number"
              name="accumulated_hours"
              placeholder="e.g. 486"
              defaultValue={type === "edit" ? data.accumulated_hours : ""}
              disabled={isPending}
              min={0}
              step="0.01"
            />
          </label>
        </div>

        <label className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">
            Supervisor Name
          </span>
          <ModalForm.Input
            type="text"
            name="supervisor_name"
            placeholder="e.g. Nico Robin"
            defaultValue={type === "edit" ? data.supervisor_name : ""}
            disabled={isPending}
            maxLength={150}
          />
        </label>

        <label className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">
            Notes
          </span>
          <ModalForm.Textarea
            name="notes"
            placeholder="e.g. Completed with strong performance in leadership."
            className="min-h-24"
            defaultValue={type === "edit" ? data.notes : ""}
            disabled={isPending}
            maxLength={2000}
          />
        </label>
      </ModalForm.Section>

      <ModalForm.Actions
        isPending={isPending}
        disableCancelWhilePending
        submitLabel={type === "edit" ? "Save Changes" : "Post Record"}
      />
    </ModalForm.Root>
  );
}

export default PastInternshipPostEditForm;
