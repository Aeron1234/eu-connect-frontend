"use client";

import ModalForm from "@/components/ui/ModalForm";
import { uploadInternshipFile } from "@/lib/server-actions/internship-docs-actions";
import { useState, useTransition, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateCurrentInternshipDocuments } from "@/lib/cache/current-internship-documents-queries";
import { toastAndAction } from "../../lib/helpers";

function StorageUploadForm({ fileRequirementTypes = [], currentUserId = "", internshipId = "" }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [selectedRequirementId, setSelectedRequirementId] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Uploading file...",
        successLabel: "File was added.",
        errorLabel: "Upload failed.",
        action: uploadInternshipFile,
        formData,
      });
      if (result?.success && currentUserId && internshipId) {
        void invalidateCurrentInternshipDocuments(queryClient, currentUserId, internshipId);
      }
    });
  }

  function handleSelectRequirement(reqType) {
    setSelectedRequirementId(reqType.id);
    setSelectedLabel(reqType.name);
    setQuery(reqType.name);
    setIsOpen(false);
  }

  const filteredTypes = fileRequirementTypes.filter((rt) =>
    rt.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ModalForm.Root action={handleAction} className="w-full text-sm">
      <ModalForm.Section title="File Details">
        <div className="flex-1 flex gap-1 flex-col">
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">Company Name</span>
          <ModalForm.Input
            type="text"
            name="company_name"
            disabled={isPending}
          />
        </div>

        <div className="flex-1 flex gap-1 flex-col">
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">File Name</span>
          <ModalForm.Input
            type="text"
            name="file_name"
            disabled={isPending}
          />
        </div>

        <div className="flex-1 flex gap-1 flex-col">
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">File</span>
          <ModalForm.Input
            type="file"
            name="file"
            accept=".pdf,.txt,.doc,.docx,.xls,.xlsx"
            className="file:mr-4 file:text-sm file:font-semibold"
            disabled={isPending}
          />
        </div>

        <div className="flex-1 flex gap-1 flex-col relative" ref={wrapperRef}>
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">Category</span>

          {/* Hidden field to submit with FormData */}
          <ModalForm.Input
            type="hidden"
            name="requirement_type_id"
            value={selectedRequirementId}
            disabled={isPending}
          />

          <ModalForm.Input
            type="text"
            placeholder="Select a requirement category"
            disabled={isPending}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              // Clear the committed selection if the user edits the text
              if (e.target.value !== selectedLabel) {
                setSelectedRequirementId("");
              }
            }}
          />

          {isOpen && (
            <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl border border-border bg-card shadow-md z-10">
              {filteredTypes.length === 0 ? (
                <li className="px-4 py-2 text-foreground-subtle">
                  No items found.
                </li>
              ) : (
                filteredTypes.map((reqType) => (
                  <li
                    key={reqType.id}
                    onClick={() => handleSelectRequirement(reqType)}
                    className={`px-4 py-2 cursor-pointer hover:bg-muted ${
                      reqType.id === selectedRequirementId
                        ? "bg-muted font-semibold"
                        : ""
                    }`}
                  >
                    {reqType.name}{" "}
                    <span className="text-foreground-subtle text-sm">
                      ({reqType.category})
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </ModalForm.Section>

      <ModalForm.Actions isPending={isPending} submitLabel="Save" />
    </ModalForm.Root>
  );
}

export default StorageUploadForm;
