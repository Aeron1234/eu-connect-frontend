"use client";

import ModalForm, { controlClass } from "@/components/ui/ModalForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { modalFormSelectContentClass } from "@/components/ui/modalFormStyles";

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
    <ModalForm.Root action={handleAction}>
      <ModalForm.Section title="Internship Details">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Company Name
            </span>
            <ModalForm.Input
              type="text"
              name="company_name"
              placeholder="e.g. Accenture Philippines"
              defaultValue={type === "edit" ? data.company_name : ""}
              disabled={isPending}
              maxLength={150}
              required
            />
          </label>

          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Position Title
            </span>
            <ModalForm.Input
              type="text"
              name="position"
              placeholder="e.g. Software Developer Intern"
              defaultValue={type === "edit" ? data.position : ""}
              disabled={isPending}
              maxLength={150}
              required
            />
          </label>
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Vacancies
            </span>
            <ModalForm.Input
              type="number"
              name="vacancies"
              placeholder="1"
              defaultValue={type === "edit" ? data.vacancies : ""}
              disabled={isPending}
              min={1}
              required
            />
          </label>

          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Location
            </span>
            <ModalForm.Input
              type="text"
              name="location"
              placeholder="e.g. Makati City"
              defaultValue={type === "edit" ? data.location : ""}
              disabled={isPending}
              maxLength={150}
              required
            />
          </label>
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Work Type
            </span>
            <Select
              name="work_type"
              defaultValue={type === "edit" ? data.work_type : "on-site"}
              disabled={isPending}
              required
            >
              <SelectTrigger className={controlClass}>
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className={modalFormSelectContentClass}>
                {WORK_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="whitespace-normal break-words py-2">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Duration (hours)
            </span>
            <ModalForm.Input
              type="number"
              name="duration_hours"
              placeholder="e.g. 486"
              defaultValue={type === "edit" ? data.duration_hours : ""}
              disabled={isPending}
              min={1}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium leading-5 text-foreground-soft">
            Description
          </span>
          <ModalForm.Textarea
            name="description"
            placeholder="Describe the internship role and responsibilities..."
            className="min-h-24"
            defaultValue={type === "edit" ? data.description : ""}
            disabled={isPending}
            maxLength={2000}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium leading-5 text-foreground-soft">
            Requirements
          </span>
          <ModalForm.Textarea
            name="requirements"
            placeholder={
              "3rd or 4th year student\nBasic programming skills\nWilling to learn"
            }
            className="min-h-24"
            defaultValue={type === "edit" ? data.requirements : ""}
            disabled={isPending}
            maxLength={2000}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium leading-5 text-foreground-soft">
            Eligible Courses
          </span>
          <div className="flex flex-wrap gap-1.5" data-required-group="course_ids" data-validation-message="Select at least one eligible course.">
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

      </ModalForm.Section>
      <ModalForm.Section title="Contact Information">

          <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-xs font-medium leading-5 text-foreground-soft">
                Contact Person
              </span>
              <ModalForm.Input
                type="text"
                name="contact_name"
                placeholder="e.g. HR Department"
                defaultValue={type === "edit" ? data.contact_name : ""}
                disabled={isPending}
                maxLength={150}
              />
            </label>

            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-xs font-medium leading-5 text-foreground-soft">
                Email
              </span>
              <ModalForm.Input
                type="email"
                name="contact_email"
                placeholder="e.g. hr@company.ph"
                defaultValue={type === "edit" ? data.contact_email : ""}
                disabled={isPending}
                maxLength={150}
                required
              />
            </label>
          </div>

          <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-xs font-medium leading-5 text-foreground-soft">
                Phone
              </span>
              <ModalForm.Input
                type="text"
                name="contact_phone"
                placeholder="e.g. (02) 8123-4567"
                defaultValue={type === "edit" ? data.contact_phone : ""}
                disabled={isPending}
                maxLength={50}
              />
            </label>

            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-xs font-medium leading-5 text-foreground-soft">
                Website
              </span>
              <ModalForm.Input
                type="text"
                name="contact_website"
                placeholder="e.g. company.ph"
                defaultValue={type === "edit" ? data.contact_website : ""}
                disabled={isPending}
                maxLength={150}
              />
            </label>
          </div>
      </ModalForm.Section>

      <ModalForm.Actions isPending={isPending} submitLabel="Post" />
    </ModalForm.Root>
  );
}

export default InternshipPostForm;
