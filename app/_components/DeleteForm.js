import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

function DeleteForm({ handleAction, isPending, id, name }) {
  return (
    <form action={handleAction}>
      <input
        type="hidden"
        name={name}
        defaultValue={id}
        className="pointer-events-none cursor-not-allowed"
      />
      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            className={"bg-red-600 hover:bg-primary-500 w-fit "}
            type="submit"
            disabled={isPending}
            // onClick={() => toast.success("Event has been created")}
          >
            {isPending ? (
              <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

export default DeleteForm;
