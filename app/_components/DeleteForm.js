import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

function DeleteForm({
  handleAction,
  isPending,
  id,
  name,
  usage = "",
  path = null,
}) {
  // console.log(id);

  return (
    <form action={handleAction}>
      <input type="hidden" name={name} defaultValue={id} />

      {usage === "storage" && (
        <input type="hidden" name="filePath" value={path} />
      )}

      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
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
              // onClick={() => toast.success("Event has been created")}
            >
              {isPending ? (
                <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

export default DeleteForm;
