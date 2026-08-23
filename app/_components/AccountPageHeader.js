"use client";

import { Pencil, X, Check, User } from "lucide-react";

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <User className="w-7 h-7 text-primary-500" />
            My Account
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            View and manage your profile details, records, and security
            settings.
          </p>
        </div>

        <div className="flex justify-end">
          {!isEditing ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition"
            >
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-semibold">Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 rounded-md text-sm font-semibold text-foreground hover:bg-secondary transition disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
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
