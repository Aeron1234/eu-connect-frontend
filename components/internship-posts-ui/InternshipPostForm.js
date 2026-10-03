"use client";

import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const WORK_TYPES = [
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

function InternshipPostForm({
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
          <span className="text-sm font-semibold text-muted-foreground">
            Company Name
          </span>
          <input
            type="text"
            name="company_name"
            placeholder="e.g. Accenture Philippines"
            className="px-2 py-1 border border-border rounded-md"
            defaultValue={type === "edit" ? data.company_name : ""}
            disabled={isPending}
            maxLength={150}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
            Position Title
          </span>
          <input
            type="text"
            name="position"
            placeholder="e.g. Software Developer Intern"
            className="px-2 py-1 border border-border rounded-md"
            defaultValue={type === "edit" ? data.position : ""}
            disabled={isPending}
            maxLength={150}
            required
          />
        </label>
      </div>

      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
            Vacancies
          </span>
          <input
            type="number"
            name="vacancies"
            placeholder="1"
            className="px-2 py-1 border border-border rounded-md"
            defaultValue={type === "edit" ? data.vacancies : ""}
            disabled={isPending}
            min={1}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
            Location
          </span>
          <input
            type="text"
            name="location"
            placeholder="e.g. Makati City"
            className="px-2 py-1 border border-border rounded-md"
            defaultValue={type === "edit" ? data.location : ""}
            disabled={isPending}
            maxLength={150}
            required
          />
        </label>
      </div>

      <div className="flex gap-4 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
            Work Type
          </span>
          <select
            name="work_type"
            className="px-2 py-1.5 border border-border rounded-md bg-card"
            defaultValue={type === "edit" ? data.work_type : "on-site"}
            disabled={isPending}
            required
          >
            {WORK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
            Duration (hours)
          </span>
          <input
            type="number"
            name="duration_hours"
            placeholder="e.g. 486"
            className="px-2 py-1 border border-border rounded-md"
            defaultValue={type === "edit" ? data.duration_hours : ""}
            disabled={isPending}
            min={1}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-muted-foreground">
          Description
        </span>
        <textarea
          name="description"
          placeholder="Describe the internship role and responsibilities..."
          className="px-2 py-1 border border-border rounded-md min-h-24 overflow-y-auto resize-none"
          defaultValue={type === "edit" ? data.description : ""}
          disabled={isPending}
          maxLength={2000}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-muted-foreground">
          Requirements
        </span>
        <textarea
          name="requirements"
          placeholder={
            "3rd or 4th year student\nBasic programming skills\nWilling to learn"
          }
          className="px-2 py-1 border border-border rounded-md min-h-24 overflow-y-auto resize-none"
          defaultValue={type === "edit" ? data.requirements : ""}
          disabled={isPending}
          maxLength={2000}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-muted-foreground">
          Eligible Courses
        </span>
        <div className="flex flex-wrap gap-1.5">
          {courses.map((course) => {
            const isChecked =
              type === "edit" && data.courses?.some((c) => c.id === course.id);
            return (
              <label key={course.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="course_ids"
                  value={course.id}
                  defaultChecked={isChecked}
                  disabled={isPending}
                  className="peer sr-only"
                />
                <span className="block px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground bg-card transition-colors peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary peer-disabled:opacity-50">
                  {course.short_name || course.course_name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4 flex flex-col gap-4">
        <p className="text-sm font-semibold text-foreground-soft">
          Contact Information
        </p>

        <div className="flex gap-4 max-sm:flex-col">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Contact Person
            </span>
            <input
              type="text"
              name="contact_name"
              placeholder="e.g. HR Department"
              className="px-2 py-1 border border-border rounded-md"
              defaultValue={type === "edit" ? data.contact_name : ""}
              disabled={isPending}
              maxLength={150}
            />
          </label>

          <label className="flex flex-col gap-1 flex-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              name="contact_email"
              placeholder="e.g. hr@company.ph"
              className="px-2 py-1 border border-border rounded-md"
              defaultValue={type === "edit" ? data.contact_email : ""}
              disabled={isPending}
              maxLength={150}
              required
            />
          </label>
        </div>

        <div className="flex gap-4 max-sm:flex-col">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Phone
            </span>
            <input
              type="text"
              name="contact_phone"
              placeholder="e.g. (02) 8123-4567"
              className="px-2 py-1 border border-border rounded-md"
              defaultValue={type === "edit" ? data.contact_phone : ""}
              disabled={isPending}
              maxLength={50}
            />
          </label>

          <label className="flex flex-col gap-1 flex-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Website
            </span>
            <input
              type="text"
              name="contact_website"
              placeholder="e.g. company.ph"
              className="px-2 py-1 border border-border rounded-md"
              defaultValue={type === "edit" ? data.contact_website : ""}
              disabled={isPending}
              maxLength={150}
            />
          </label>
        </div>
      </div>

      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={`bg-primary hover:bg-primary-400 w-fit ${isPending ? "pointer-events-none opacity-50" : ""} `}
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
              ) : (
                "Post"
              )}
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

export default InternshipPostForm;
