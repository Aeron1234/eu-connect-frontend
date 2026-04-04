"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useActionState, useState } from "react";
import CompanyAddressSearchList from "./CompanyAddressSearchList";
import { toastAndAction } from "../_services/helpers";
import { createInternshipRecord } from "../_services/student-actions";

function StudentInternshipForm() {
  const [internshipForm, setInternshipForm] = useState({
    company_name: "",
    company_address: "",
    date_started: "",
    total_hours: "",
    state_or_province: "",
    city_or_town: "",
    lat: "",
    lon: "",
  });
  const [selectedAddress, setSelectedAddress] = useState("");
  const [state, formAction, isPending] = useActionState(
    createInternshipRecord,
    null,
  );

  async function handleAction(internshipData) {
    const formData = new FormData();

    for (let key in internshipData) {
      formData.append(key, internshipData[key]);
    }

    const handlers = {
      loadingLabel: "Creating internship record...",
      successLabel: "Good luck on your internship!.",
      errorLabel: "Creating internship record failed.",
      action: createInternshipRecord,
      formData,
    };

    await toastAndAction(handlers);

    setSelectedAddress("");
    setInternshipForm({
      company_name: "",
      company_address: "",
      date_started: "",
      total_hours: "",
      state_or_province: "",
      city_or_town: "",
      lat: "",
      lon: "",
    });
  }

  return (
    <form
      className="flex flex-col gap-4 text-sm"
      action={() => handleAction(internshipForm)}
    >
      <Input
        name={"company_name"}
        label={"Name of company"}
        placeholder={"E.g. Abc Company"}
        type={"text"}
        value={internshipForm.company_name}
        onChange={(e) =>
          setInternshipForm({ ...internshipForm, company_name: e.target.value })
        }
        disabled={isPending}
      />

      <div className="relative">
        <Input
          name={"company_address"}
          label={"Company's address"}
          placeholder={"Search your company's address here..."}
          type={"text"}
          value={internshipForm.company_address}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              company_address: e.target.value,
            })
          }
          disabled={isPending}
        />

        {internshipForm.company_address &&
        internshipForm.company_address !== selectedAddress ? (
          <CompanyAddressSearchList
            internshipForm={internshipForm}
            setInternshipForm={setInternshipForm}
            address={internshipForm.company_address}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
          />
        ) : null}
      </div>

      <div className="flex gap-2 w-full">
        <Input
          name={"city_or_town"}
          label={"City or Municipality"}
          type={"text"}
          value={internshipForm.city_or_town}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              city_or_town: e.target.value,
            })
          }
          placeholder={"Candelaria"}
          disabled={isPending}
        />

        <Input
          name={"state_or_province"}
          label={"State or Province"}
          type={"text"}
          value={internshipForm.state_or_province}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              state_or_province: e.target.value,
            })
          }
          placeholder={"Quezon"}
          disabled={isPending}
        />
      </div>

      <div className="flex gap-2 w-full mb-5">
        <Input
          name={"date_started"}
          label={"Starting date"}
          type={"date"}
          value={internshipForm.date_started}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              date_started: e.target.value,
            })
          }
          disabled={isPending}
        />

        <Input
          name={"total_hours"}
          label={"Total hours"}
          placeholder={"E.g. 200"}
          type={"number"}
          value={internshipForm.total_hours}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              total_hours: Number(e.target.value),
            })
          }
          disabled={isPending}
        />
      </div>

      <DialogFooter>
        <div className="flex gap-2 font-semibold self-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"} disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={"bg-primary-500 hover:bg-primary-400 w-fit "}
              type="submit"
              disabled={isPending}
            >
              Create
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

function Input({ name, label, type, placeholder, value, onChange, disabled }) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <label htmlFor={name} className=" text-stone-500">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className="p-2 flex-1 rounded-sm border border-stone-300"
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
      />
    </div>
  );
}

export default StudentInternshipForm;
