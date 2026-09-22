"use client";

import { Pencil, X, Check, User } from "lucide-react";
import PageTitle from "./PageTitle";

export default function AccountPageHeader({
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  saveError,
}) {
  return (
    <>
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
        <PageTitle
          Icon={User}
          title={"My Account"}
          description={
            "View and manage your profile details, records, and securitysettings."
          }
        />

        <div className="flex sm:justify-end w-full">
          {!isEditing ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition w-full sm:w-auto"
            >
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-semibold">Edit Profile</span>
            </button>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="inline-flex items-center justify-center border border-border gap-2 px-4 py-2.5 rounded-md text-sm text-foreground font-semibold transition w-full sm:w-auto disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition w-full sm:w-auto"
              >
                <Check className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {saveError && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {saveError}
        </p>
      )}
    </>
  );
}
