"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function StorageUploadForm() {
  return (
    <form
      action={() => console.log("submitted")}
      className="flex w-full flex-col gap-5"
    >
      <div className="flex-1 flex gap-1 flex-col">
        <input
          type="file"
          name="file"
          className="w-full px-4 py-2 rounded-md border border-stone-300 text-sm block file:mr-4 file:text-sm file:font-semibold"
        />
        <DialogDescription className={"text-sm"}>
          Save your internship related documents here.
        </DialogDescription>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>

        <Button
          className={
            "bg-primary-500 hover:bg-primary-400 w-fit self-end font-semibold"
          }
        >
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export default StorageUploadForm;
