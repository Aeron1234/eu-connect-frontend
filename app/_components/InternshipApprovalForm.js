"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheck, CircleX, User } from "lucide-react";
import MapSmallContainer from "./MapSmallContainer";
import { useState, useTransition } from "react";
import { approveInternshipRecord } from "@/lib/server-actions/internship-records-actions";
import { toastAndAction } from "../../lib/helpers";

function InternshipApprovalForm({ approvalData }) {
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    id,
    user_id,
    first_name,
    last_name,
    course_name,
    description,
    company_name,
    internship_position,
    company_website,
    total_hours,
    region_name,
    lat,
    lon,
  } = approvalData;

  function handleAction(formData) {
    formData.append("id", id);
    formData.append("user_id", user_id);

    startTransition(
      async () =>
        await toastAndAction({
          loadingLabel: "Updating record...",
          successLabel: "Record updated successfully",
          errorLabel: "Error updating record",
          action: approveInternshipRecord,
          formData,
        }),
    );
  }

  return (
    <form className="w-full" action={handleAction}>
      <div className="flex flex-col gap-4 text-xs h-full max-h-125 overflow-y-auto pr-2">
        <div className="flex-1 flex flex-col px-4 py-2 border border-border rounded-sm">
          <h3 className="flex items-center gap-4 py-2">
            <span className="text-primary-emphasis">
              <User className="h-5 w-5" />
            </span>
            <span className="text-sm">{`${first_name} ${last_name}`}</span>
          </h3>
          <p className="text-muted-foreground font-medium tracking-wide">
            {course_name}
          </p>
        </div>

        <div className="flex-1 flex gap-4 max-xs:flex-col">
          <NotificationInfo label={"Company"} text={company_name} />
          <NotificationInfo label={"Position"} text={internship_position} />
        </div>

        <div className="flex-1 flex gap-4 max-xs:flex-col">
          <NotificationInfo label={"Required Hours"} text={total_hours} />
          <NotificationInfo label={"Region"} text={region_name} />
        </div>

        <div className="flex-1 flex gap-4 max-xs:flex-col">
          <NotificationInfo label={"Position"} text={internship_position} />
          <NotificationInfo label={"Position"} text={internship_position} />
        </div>

        <NotificationInfo label={"Description"} text={description} />

        <NotificationInfo label={"Company Website"} text={company_website} />

        <div className="flex-1">
          <MapSmallContainer company_lat={lat} company_lon={lon} />
        </div>
      </div>

      <input
        type="hidden"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={isPending}
      />

      <DialogFooter>
        <div className="flex font-semibold w-full justify-end mt-4 gap-1">
          <Button
            variant="outline"
            className={"w-fit"}
            onClick={() => setStatus("rejected")}
          >
            <span>
              <CircleX className="h-5 w-5" />
            </span>{" "}
            Ignore
          </Button>

          <Button
            className={"bg-primary hover:bg-primary-400 w-fit "}
            type="submit"
            onClick={() => setStatus("ongoing")}
            disabled={isPending}
            // onClick={() => toast.success("Event has been created")}
          >
            {isPending ? (
              <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
            ) : (
              <div className="flex items-center gap-1">
                <span>
                  <CircleCheck className="h-5 w-5" />
                </span>{" "}
                Approve
              </div>
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

function NotificationInfo({ label, text }) {
  return (
    <div className="flex-1 flex flex-col px-4 py-2 border border-border rounded-sm">
      <span className="text-muted-foreground tracking-wide">{label}</span>
      <p className="font-medium">{text}</p>
    </div>
  );
}

export default InternshipApprovalForm;
