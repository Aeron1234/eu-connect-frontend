"use client";

import InternshipFormSection from "./InternshipFormSection";

import MapFormContainer from "../map-ui/MapFormContainer";
import { labelClass, textareaClass } from "./internshipFormStyles";

export default function InternshipLocationFields({ internshipForm, setInternshipForm, isPending, status }) {
  return (
    <InternshipFormSection number="04" title="Company location" description="Find your company on the map and check the selected address.">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-xs leading-relaxed text-muted-foreground">Use the search bar inside the map to find your company, or click directly on the map to drop a pin. *</p>
  
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
            placeholder="Choose a location on the map to fill in the address. You can also edit it manually."
            className={textareaClass}
            disabled={isPending || status}
          />
        </div>
      </div>
    </InternshipFormSection>
  );
}
