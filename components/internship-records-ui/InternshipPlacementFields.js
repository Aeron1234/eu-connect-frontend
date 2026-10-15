"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Input from "./InternshipFormInput";
import { labelClass, selectTriggerClass } from "./internshipFormStyles";

export default function InternshipPlacementFields({
  regions, internshipForm, setInternshipForm, selectedRegion, setSelectedRegion,
  isPending, status,
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-background/60 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">Placement details</h3>
        <p className="mt-1 text-xs text-foreground-soft">Tell us where you will work and what your role will be.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <Input
          name={"company_name"}
          label={"Name of company *"}
          placeholder={"E.g. Abc Company"}
          type={"text"}
          value={internshipForm.company_name}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              company_name: e.target.value,
            })
          }
          disabled={isPending || status}
        />
  
        <div className="flex min-w-0 flex-col">
          <label htmlFor="region_id" className={labelClass}>
            Region *
          </label>
  
          <Select
            name="region_id"
            value={selectedRegion}
            onValueChange={setSelectedRegion}
            disabled={isPending || status}
          >
            <SelectTrigger
              id="region_id"
              className={`mt-1 ${selectTriggerClass}`}
            >
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Regions</SelectLabel>
                {regions.length > 0 &&
                  regions.map((region) => (
                    <SelectItem key={region.id} value={`${region.id}`}>
                      {region.region_name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <Input
          name={"internship_position"}
          label={"Position *"}
          type={"text"}
          value={internshipForm.internship_position}
          placeholder={"E.g., Software developer intern"}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              internship_position: e.target.value,
            })
          }
          disabled={isPending || status}
        />
  
        <Input
          name={"company_website"}
          label={"Company Website (optional)"}
          type={"text"}
          value={internshipForm.company_website}
          placeholder={"www.jollibee.com.ph, link of fb page, etc..."}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              company_website: e.target.value,
            })
          }
          disabled={isPending || status}
          required={false}
        />
      </div>

    </section>
  );
}
