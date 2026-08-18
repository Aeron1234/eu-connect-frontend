"use client";

import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function PastInternshipPostEditForm({
  handleAction,
  isPending = false,
  type = "create",
  data = {},
  courses = [],
}) {
  return (
    <form action={handleAction} className="flex-1 flex flex-col gap-4">
      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">
            Alumni Name
          </span>
          <input
            type="text"
            name="alumni_name"
            placeholder="e.g. Marco Polo"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.alumni_name : ""}
            disabled={isPending}
            maxLength={150}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">
            Internship Position
          </span>
          <input
            type="text"
            name="internship_position"
            placeholder="e.g. Software Engineering Intern"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.internship_position : ""}
            disabled={isPending}
            maxLength={150}
            required
          />
        </label>
      </div>

      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">
            Company Name
          </span>
          <input
            type="text"
            name="company_name"
            placeholder="e.g. Accenture Philippines"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.company_name : ""}
            disabled={isPending}
            maxLength={250}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">Industry</span>
          <input
            type="text"
            name="industry"
            placeholder="e.g. IT-BPM"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.industry : ""}
            disabled={isPending}
            maxLength={150}
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-500">
          Company Address
        </span>
        <input
          type="text"
          name="company_address"
          placeholder="e.g. Makati City"
          className="px-2 py-1 border border-stone-300 rounded-md"
          defaultValue={type === "edit" ? data.company_address : ""}
          disabled={isPending}
          maxLength={255}
          required
        />
      </label>

      <label className="flex flex-col gap-1 flex-1">
        <span className="text-sm font-medium text-stone-500">Course</span>
        <select
          name="course_id"
          className="px-2 py-1.5 border border-stone-300 rounded-md bg-white"
          defaultValue={type === "edit" ? data.course_id : ""}
          disabled={isPending}
          required
        >
          <option value="" disabled>
            Select course
          </option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">Batch Year</span>
          <input
            type="number"
            name="batch_year"
            placeholder="e.g. 2026"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.batch_year : ""}
            disabled={isPending}
            min={2000}
            max={2100}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">
            Academic Year
          </span>
          <input
            type="text"
            name="academic_year"
            placeholder="e.g. 2025-2026"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.academic_year : ""}
            disabled={isPending}
            maxLength={9}
            pattern="\d{4}-\d{4}"
            title="Format: YYYY-YYYY"
            required
          />
        </label>
      </div>

      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">
            Total Hours
          </span>
          <input
            type="number"
            name="total_hours"
            placeholder="e.g. 486"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.total_hours : ""}
            disabled={isPending}
            min={1}
            step="0.01"
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium text-stone-500">
            Accumulated Hours
          </span>
          <input
            type="number"
            name="accumulated_hours"
            placeholder="e.g. 486"
            className="px-2 py-1 border border-stone-300 rounded-md"
            defaultValue={type === "edit" ? data.accumulated_hours : ""}
            disabled={isPending}
            min={0}
            step="0.01"
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-500">
          Supervisor Name (optional)
        </span>
        <input
          type="text"
          name="supervisor_name"
          placeholder="e.g. Nico Robin"
          className="px-2 py-1 border border-stone-300 rounded-md"
          defaultValue={type === "edit" ? data.supervisor_name : ""}
          disabled={isPending}
          maxLength={150}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-500">
          Notes (optional)
        </span>
        <textarea
          name="notes"
          placeholder="e.g. Completed with strong performance in leadership."
          className="px-2 py-1 border border-stone-300 rounded-md min-h-24 overflow-y-auto resize-none"
          defaultValue={type === "edit" ? data.notes : ""}
          disabled={isPending}
          maxLength={2000}
        />
      </label>

      <DialogFooter>
        <div className="flex gap-2 font-medium w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={`bg-primary-500 hover:bg-primary-400 w-fit ${isPending ? "pointer-events-none opacity-50" : ""} `}
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
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
