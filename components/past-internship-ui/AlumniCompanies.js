"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import {
  deleteAlumniRecord,
  updateAlumniRecord,
} from "@/lib/server-actions/past-internships-actions";
import Modal from "../ui/Modal";
import DeleteForm from "../ui/DeleteForm";
import PastInternshipPostEditForm from "./PastInternshipPostEditForm";
import { useUser } from "@/contexts/UserContext";
import { cx } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

function initialsOf(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function AlumniCompanies({
  company,
  handleItemDelete = null,
  handleItemUpdate = null,
  courses = [],
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-semibold text-foreground truncate">
            {company.company_name}
          </p>
          <p className="text-xs text-muted-foreground flex gap-1 items-center flex-wrap">
            <span className="line-clamp-1 truncate">
              {company.company_address}
            </span>{" "}
            · <span>{company.industry}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground-soft">
            {company.alumni_count}{" "}
            {company.alumni_count === 1 ? "alumnus" : "alumni"}
          </span>
          <ChevronDown
            className={cx(
              "size-4 text-foreground-subtle transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {company.alumni.map((a) => (
            <AlumniRow
              key={a.id}
              alumni={a}
              batch={a.academic_year?.split("-")[1]}
              onUpdate={handleItemUpdate}
              onDelete={handleItemDelete}
              courses={courses}
              companyName={company.company_name}
              companyAddress={company.company_address}
              industry={company.industry}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlumniRow({
  alumni,
  batch,
  onDelete,
  onUpdate,
  courses = [],
  companyName,
  companyAddress,
  industry,
}) {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();

  const userRole = user.role;
  const userDepartment = user.department_code;

  const isAuthorizedStaff =
    (userRole === "department_head" &&
      alumni.department_code === userDepartment) ||
    userRole === "admin";

  function handleDelete(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting record...",
        successLabel: "Record deleted.",
        errorLabel: "Failed to delete record.",
        action: deleteAlumniRecord,
        formData,
      });
      if (result?.success) {
        onDelete?.(alumni.id);
      }
    });
  }

  function handleUpdate(formData) {
    formData.append("id", alumni.id);

    const handlers = {
      loadingLabel: "Updating record...",
      successLabel: "Record was updated.",
      errorLabel: "Updating record failed.",
      action: updateAlumniRecord,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        onUpdate?.(result.record);
      }
    });
  }

  return (
    <div className="border-t border-border first:border-t-0">
      <div className="flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-9 flex-shrink-0 place-items-center rounded-lg bg-primary-50 text-xs font-semibold text-primary-emphasis">
            {initialsOf(alumni.alumni_name)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {alumni.alumni_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {alumni.course_name}
              {batch ? ` · Batch ${batch}` : ""}
            </p>
          </div>
        </div>

        {isAuthorizedStaff ? (
          <div className="flex gap-3 flex-shrink-0">
            <Modal
              title={
                <span className="text-primary-emphasis">Update Record</span>
              }
              trigger={
                <div
                  aria-label="Edit record"
                  title="Edit record"
                  className="text-foreground-subtle hover:text-primary-emphasis transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </div>
              }
            >
              <PastInternshipPostEditForm
                data={{
                  ...alumni,
                  company_name: companyName,
                  company_address: companyAddress,
                  industry,
                }}
                isPending={isPending}
                courses={courses}
                handleAction={handleUpdate}
                type="edit"
              />
            </Modal>

            <Modal
              title={<span className="text-red-600">Delete Record</span>}
              trigger={
                <div
                  title="Delete record"
                  aria-label="Delete record"
                  className="text-foreground-subtle hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </div>
              }
            >
              <DeleteForm
                isPending={isPending}
                id={alumni.id}
                name="recordId"
                handleAction={handleDelete}
              />
            </Modal>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AlumniCompanies;
