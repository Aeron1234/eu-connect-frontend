"use client";
import { Clock, Eye, FileCheck } from "lucide-react";
import { format } from "date-fns";
import Modal from "./Modal";
import InternshipApprovalForm from "./InternshipApprovalForm";

function InboxApprovalItem({ notificationData, handleMarkAsRead }) {
  return (
    <Modal
      onClick={() => handleMarkAsRead(notificationData.notification_id)}
      title={"Internship Record Submission"}
      titleIcon={
        <span className="text-primary-emphasis bg-red-100 p-1 rounded-full">
          <FileCheck className="h-5 w-5" />
        </span>
      }
      titleStyles={"flex items-center gap-2"}
      description={`Approval • ${format(new Date(notificationData.created_at), "MM/dd/yyyy")}`}
      trigger={
        <>
          <span className="text-primary-emphasis bg-red-100 p-1 rounded-full self-start">
            <FileCheck className="h-5 w-5" />
          </span>

          <div className="items-start justify-self-start flex flex-col gap-1 text-muted-foreground">
            <div className="flex gap-2 items-center">
              <h3 className="font-semibold text-foreground">
                Internship Record Request
              </h3>

              {notificationData.is_read ? null : (
                <span className="p-1 rounded bg-primary h-fit"></span>
              )}

              <p className="text-xs flex items-center gap-1 text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded-full tracking-wider">
                <span>
                  <Clock className="h-3 w-3" />
                </span>
                {notificationData.status}
              </p>
            </div>
            <p className="text-xs tracking-wide">
              {notificationData.first_name} {notificationData.last_name}{" "}
              submitted an internship record for {notificationData.company_name}
            </p>

            <p className="flex items-center gap-1 text-xs">
              <span>
                <Clock className="h-3 w-3" />{" "}
              </span>{" "}
              {format(new Date(notificationData.created_at), "MM/dd/yyyy")}
            </p>
          </div>

          <span className="text-foreground-soft p-1 rounded-full self-start">
            <Eye className="h-4 w-4" />
          </span>
        </>
      }
      triggerStyles={`${!notificationData.is_read ? "bg-muted" : ""} w-full border border-border px-4 py-2 rounded-sm grid grid-cols-[auto_1fr_auto] gap-4 hover:bg-muted transition-colors cursor-pointer`}
    >
      <InternshipApprovalForm approvalData={notificationData} />
    </Modal>
  );
}

export default InboxApprovalItem;
