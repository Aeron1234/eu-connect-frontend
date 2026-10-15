"use client";

import { MapPin } from "lucide-react";
import MapFormContainer from "../map-ui/MapFormContainer";
import { labelClass, textareaClass } from "./internshipFormStyles";

export default function InternshipLocationFields({ internshipForm, setInternshipForm, isPending, status }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-background/60 p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground sm:text-base">Company location</h3>
      <div className="flex min-w-0 flex-col gap-3">
        <p className="flex flex-col gap-1">
          <span className={`flex items-center gap-1.5 ${labelClass}`}>
            <MapPin className="h-4 w-4 flex-shrink-0" /> Company Location *
          </span>
          <span className="text-xs text-muted-foreground">
            Use the search bar inside the map to find your company, or click
            directly on the map to drop a pin.
          </span>
        </p>
  
        <MapFormContainer
          data={internshipForm}
          setData={setInternshipForm}
          formType={"internshipRecord"}
          mapStyle={{ height: "min(320px, 55vh)", width: "100%" }}
        />
  
        <div className="flex flex-col">
          <label htmlFor="company_address_display" className={labelClass}>
            Selected Address
          </label>
          <textarea
            id="company_address_display"
            rows={2}
            value={internshipForm.company_address}
            onChange={(e) =>
              setInternshipForm((prev) => ({
                ...prev,
                company_address: e.target.value,
              }))
            }
            placeholder="Selecting a location on the map fills this in — you can also edit it manually."
            className={textareaClass}
            disabled={isPending || status}
          />
        </div>
      </div>
    </section>
  );
}
