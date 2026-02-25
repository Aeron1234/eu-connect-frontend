"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { createInternshipRecord } from "../_services/actions";

function StudentInternshipForm() {
  return (
    <form
      className="flex flex-col gap-4 text-sm"
      action={createInternshipRecord}
    >
      <Input
        name={"company_name"}
        label={"Name of company"}
        placeholder={"E.g. Abc Company"}
        type={"text"}
      />
      <Input
        name={"address_line_1"}
        label={"Company address line 1"}
        placeholder={"Building or house no., subdivision or street name, etc."}
        type={"text"}
      />
      <Input
        name={"address_line_2"}
        label={"Company address line 2"}
        placeholder={"Barangay"}
        type={"text"}
      />
      <Input
        name={"town_or_city"}
        label={"Town or city"}
        placeholder={"E.g. Candelaria"}
        type={"text"}
      />

      <Input
        name={"state_or_province"}
        label={"State or province"}
        placeholder={"E.g. Quezon"}
        type={"text"}
      />

      <div className="flex gap-4 w-full mb-5">
        <Input name={"date_started"} label={"Starting date"} type={"date"} />

        <Input
          name={"total_hours"}
          label={"Total hours"}
          placeholder={"E.g. 200"}
          type={"number"}
        />
      </div>

      <DialogFooter>
        <div className="flex gap-2 font-semibold self-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            className={"bg-primary-500 hover:bg-primary-400 w-fit "}
            type="submit"
          >
            Create
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

function Input({ name, label, type, placeholder, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-semibold">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className="px-2 py-1 rounded-sm border border-stone-300 w-full"
        disabled={disabled}
        required
      />
    </div>
  );
}

export default StudentInternshipForm;
