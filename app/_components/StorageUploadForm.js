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
