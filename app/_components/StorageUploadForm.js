"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { uploadInternshipFile } from "@/lib/server-actions/internship-docs-actions";
import { useState, useTransition, useRef, useEffect } from "react";
import { toastAndAction } from "../../lib/helpers";

function StorageUploadForm({ fileRequirementTypes = [] }) {
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
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Uploading file...",
        successLabel: "File was added.",
        errorLabel: "Upload failed.",
        action: uploadInternshipFile,
        formData,
      }),
    );
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
    <form action={handleAction} className="flex w-full flex-col gap-4 text-sm">
      <div className="flex-1 flex gap-1 flex-col">
        <span className="font-semibold text-foreground-soft">Company Name</span>
        <input
          type="text"
          name="company_name"
          className="w-full px-4 py-2 rounded-md border border-border text-sm block"
          disabled={isPending}
        />
      </div>

      <div className="flex-1 flex gap-1 flex-col">
        <span className="font-semibold text-foreground-soft">File Name</span>
        <input
          type="text"
          name="file_name"
          className="w-full px-4 py-2 rounded-md border border-border text-sm block"
          disabled={isPending}
        />
      </div>

      <div className="flex-1 flex gap-1 flex-col">
        <span className="font-semibold text-foreground-soft">File</span>
        <input
          type="file"
          name="file"
          accept=".pdf,.txt,.doc,.docx,.xls,.xlsx"
          className="w-full px-4 py-2 rounded-md border border-border text-sm block file:mr-4 file:text-sm file:font-semibold"
          disabled={isPending}
        />
      </div>

      <div className="flex-1 flex gap-1 flex-col relative" ref={wrapperRef}>
        <span className="font-semibold text-foreground-soft">Category</span>

        {/* Hidden field to submit with FormData */}
        <input
          type="hidden"
          name="requirement_type_id"
          value={selectedRequirementId}
          disabled={isPending}
        />

        <input
          type="text"
          placeholder="Select a requirement category"
          className="w-full px-4 py-3 rounded-sm border border-border text-sm block"
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
          <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-card shadow-md z-10">
            {filteredTypes.length === 0 ? (
              <li className="px-4 py-2 text-foreground-subtle">No items found.</li>
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

      <DialogFooter>
        <div className="flex gap-2 font-semibold self-end">
          <DialogClose asChild>
            <Button variant="outline" className="w-fit">
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className="bg-primary hover:bg-primary-400 w-fit"
              type="submit"
              disabled={isPending}
            >
              Save
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

export default StorageUploadForm;
