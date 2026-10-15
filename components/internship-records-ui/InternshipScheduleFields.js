"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Input from "./InternshipFormInput";
import { labelClass, selectTriggerClass } from "./internshipFormStyles";

export default function InternshipScheduleFields({ internshipForm, setInternshipForm, isPending, status }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-background/60 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">Schedule and hours</h3>
        <p className="mt-1 text-xs text-foreground-soft">Add your expected internship dates and required hours.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <Input
          name={"date_started"}
          label={"Start date *"}
          type={"date"}
          value={internshipForm.date_started}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              date_started: e.target.value,
            })
          }
          disabled={isPending || status}
        />
  
        <Input
          name={"date_ended"}
          label={"Date end (estimated) *"}
          type={"date"}
          value={internshipForm.date_ended}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              date_ended: e.target.value,
            })
          }
          disabled={isPending || status}
        />
      </div>

    {/* Total Hours and Semester */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="flex min-w-0 flex-col">
          <label htmlFor="semester" className={labelClass}>
            Semester *
          </label>
  
          <Select
            name="semester"
            value={internshipForm.semester}
            onValueChange={(value) =>
              setInternshipForm((prev) => ({ ...prev, semester: value }))
            }
            disabled={isPending || status}
          >
            <SelectTrigger
              id="semester"
              className={`mt-1 ${selectTriggerClass}`}
            >
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Semester</SelectLabel>
                {[
                  { label: "First", value: "1st" },
                  { label: "Second", value: "2nd" },
                  { label: "Summer", value: "summer" },
                ].map((sem) => (
                  <SelectItem key={sem.value} value={sem.value}>
                    {sem.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
  
        <Input
          name={"total_hours"}
          label={"Set Total hours *"}
          placeholder={"E.g. 200"}
          type={"number"}
          value={internshipForm.total_hours}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              total_hours: Number(e.target.value),
            })
          }
          disabled={isPending || status}
        />
      </div>

    </section>
  );
}
