"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { uploadInternshipFile } from "../_services/student-actions";
import { useTransition } from "react";
import { toastAndAction } from "../_services/helpers";

function StorageUploadForm() {
  const [isPending, startTransition] = useTransition();

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

  return (
    <form action={handleAction} className="flex w-full flex-col gap-4 text-sm">
      <label className="flex-1 flex gap-1 flex-col">
        <span className="font-semibold text-stone-600">Company Name</span>
        <input
          type="text"
          name="company_name"
          className={`w-full px-4 py-2 rounded-md border border-stone-300 text-sm block file:mr-4 file:text-sm file:font-semibold`}
          disabled={isPending}
        />
      </label>

      <label className="flex-1 flex gap-1 flex-col">
        <span className="font-semibold text-stone-600">File Name</span>
        <input
          type="text"
          name="file_name"
          className={`w-full px-4 py-2 rounded-md border border-stone-300 text-sm block file:mr-4 file:text-sm file:font-semibold`}
          disabled={isPending}
        />
      </label>

      <label className="flex-1 flex gap-1 flex-col">
        <span className="font-semibold text-stone-600">File</span>
        <input
          type="file"
          name="file"
          accept=".pdf,.txt,.doc,.docx,.xls,.xlsx"
          className={`w-full px-4 py-2 rounded-md border border-stone-300 text-sm block file:mr-4 file:text-sm file:font-semibold`}
          disabled={isPending}
        />
      </label>

      <label className="flex-1 flex gap-1 flex-col">
        <span className="font-semibold text-stone-600">Category</span>
        <select
          name="category"
          className={`w-full px-4 py-2 rounded-md border border-stone-300 text-sm block file:mr-4 file:text-sm file:font-semibold`}
          defaultValue={"Select Category"}
          disabled={isPending}
        >
          <option disabled>Select Category</option>
          <option value={"before"}>Before</option>
          <option value={"after"}>After</option>
        </select>
      </label>

      <DialogFooter>
        <div className="flex gap-2 font-semibold self-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={"bg-primary-500 hover:bg-primary-400 w-fit "}
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
