"use client";

import { CircleAlert, MapPin } from "lucide-react";
import { useState, useTransition } from "react";
import MapFormContainer from "../map-ui/MapFormContainer";
import SpinnerMini from "../ui/SpinnerMini";
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
import { createInternshipRecord } from "@/lib/server-actions/internship-records-actions";
import { toastAndAction } from "../../lib/helpers";

const labelClass = "text-sm font-medium text-foreground";
const inputClass =
  "mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const selectTriggerClass =
  "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm shadow-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
const textareaClass =
  "mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

function InternshipRecordForm({ regions = [], recordStatus = "", onCreated }) {
  const status = recordStatus === "pending" || recordStatus === "ongoing";

  const [showForm, setShowForm] = useState(!status);
  const [internshipForm, setInternshipForm] = useState({
    company_name: "",
    company_address: "",
    internship_position: "",
    company_website: "",
    description: "",
    date_started: "",
    date_ended: "",
    total_hours: "",
    semester: "",
    lat: "",
    lon: "",
  });
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
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

    startTransition(async () => {
      const result = await toastAndAction(handlers);

      if (result?.success) {
        onCreated?.();
        setInternshipForm({
          company_name: "",
          company_address: "",
          internship_position: "",
          company_website: "",
          description: "",
          date_started: "",
          date_ended: "",
          total_hours: "",
          semester: "",
          lat: "",
          lon: "",
        });
        setSelectedRegion("");
      }
    });
  }

  return (
    <>
      <InternshipRecordFormHeader
        showForm={showForm}
        setShowForm={setShowForm}
      />

      {status && (
        <p className="my-5 flex items-start gap-2 rounded-lg border border-border bg-secondary/70 px-3 py-3 text-xs leading-relaxed text-muted-foreground sm:items-center sm:px-4 sm:text-sm">
          <span className="text-primary-emphasis flex-shrink-0">
            <CircleAlert className="h-5 w-5" />
          </span>
          The form is locked because you currently have an ongoing or pending
          internship record.
        </p>
      )}

      {showForm && (
        <form
          className={`relative mt-5 flex min-w-0 flex-col gap-4 sm:gap-5 ${status ? "opacity-50 pointer-events-none" : ""}`}
          action={handleAction}
        >
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

          <section className="min-w-0 rounded-xl border border-border bg-background/60 p-4 sm:p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground sm:text-base">Activities</h3>
          <div className="flex flex-col">
            <label htmlFor="description" className={labelClass}>
              Description *
            </label>
            <textarea
              name="description"
              placeholder="Assisting developers on front-end development..."
              id="description"
              rows={3}
              className={textareaClass}
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

          </section>

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

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 sm:w-auto sm:self-end"
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
    <div className="flex flex-col">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={inputClass}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

export default InternshipRecordForm;
