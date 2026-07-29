"use client";

import { CircleAlert, MapPin } from "lucide-react";
import { useState, useTransition } from "react";
import MapFormContainer from "./MapFormContainer";
import SpinnerMini from "./SpinnerMini";
import InternshipRecordFormHeader from "./InternshipRecordFormHeader";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInternshipRecord } from "../_services/student-actions";
import { toastAndAction } from "../_services/helpers";

function InternshipRecordForm({ regions = [], recordStatus = "" }) {
  const status = recordStatus === "pending" || recordStatus === "ongoing";
  console.log(recordStatus);

  const [showForm, setShowForm] = useState(!status);
  const [internshipForm, setInternshipForm] = useState({
    company_name: "",
    company_address: "",
    internship_position: "",
    company_website: "",
    description: "",
    date_started: "",
    total_hours: "",
    lat: "",
    lon: "",
  });
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    // formData.append("region_id", selectedRegion);
    formData.append("company_address", internshipForm.company_address);
    formData.append("lat", internshipForm.lat);
    formData.append("lon", internshipForm.lon);

    const handlers = {
      loadingLabel: "Creating internship record...",
      successLabel: "Good luck on your internship!",
      errorLabel: "Creating internship record failed.",
      action: createInternshipRecord,
      formData,
    };

    startTransition(async () => await toastAndAction(handlers));

    const obj = Object.fromEntries(formData);
    console.log(obj);
  }

  return (
    <>
      <InternshipRecordFormHeader
        showForm={showForm}
        setShowForm={setShowForm}
      />

      {status && (
        <p className="flex items-center gap-1 px-4 py-2 bg-stone-200 border border-stone-300 rounded-sm">
          <span className="text-primary-500">
            <CircleAlert className="h-5 w-5" />
          </span>
          The form is locked because you currently have an ongoing or pending
          internship record.
        </p>
      )}

      {showForm && (
        <form
          className={`flex flex-col gap-4 ${status ? "opacity-50 pointer-events-none" : ""} z-10`}
          action={handleAction}
        >
          <div className="flex items-center gap-8">
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

            <div className="flex-1">
              <label htmlFor="region_id">Region *</label>

              <input
                type="hidden"
                name="region_id"
                value={selectedRegion}
                disabled={isPending || status}
              />
              <Select
                className="w-full h-full"
                name="region_id"
                onValueChange={setSelectedRegion}
                disabled={isPending || status}
              >
                <SelectTrigger
                  id="region_id"
                  className="h-10 px-3 text-sm w-full mt-1 bg-stone-100  rounded-sm border border-stone-300 focus:ring-2 focus:ring-stone-300 focus:border-transparent"
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

          <div className="flex items-center gap-8">
            <Input
              name={"internship_position"}
              label={"Postion *"}
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

          <div className="flex items-center gap-8">
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

          <div className="flex flex-col gap-1">
            <label htmlFor="description">Description *</label>
            <textarea
              name="description"
              placeholder="Assisting developers on front-end development..."
              id="description"
              className="px-2 py-1 border border-stone-300 rounded-md min-h-10 overflow-y-auto resize-none bg-stone-100"
              defaultValue={internshipForm.description}
              onChange={(e) =>
                setInternshipForm({
                  ...internshipForm,
                  description: e.target.value,
                })
              }
              disabled={isPending || status}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="flex flex-col gap-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Company Location *
              </span>
              <span className="text-xs text-stone-500">
                Use the search bar inside the map to find your company.
                Selecting a result will pin it.
              </span>
            </p>

            <MapFormContainer
              data={internshipForm}
              setData={setInternshipForm}
              formType={"internshipRecord"}
              mapStyle={{ height: "400px", width: "100%" }}
            />

            {internshipForm.company_address && (
              <p className="bg-stone-100 p-2 rounded-sm border border-stone-300">
                <span className="font-semibold">Selected:</span>{" "}
                {internshipForm.company_address}
              </p>
            )}
          </div>

          <button
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-sm font-semibold self-end cursor-pointer transition-colors hover:bg-primary-400"
            disabled={isPending || status}
          >
            {isPending ? (
              <span className="flex w-full justify-center">
                <SpinnerMini />
              </span>
            ) : (
              "Create Internship Record"
            )}
          </button>
        </form>
      )}
    </>
  );
}

function Input({
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled,
  required = true,
}) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className="p-2 flex-1 rounded-sm border border-stone-300 bg-stone-100"
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

export default InternshipRecordForm;
