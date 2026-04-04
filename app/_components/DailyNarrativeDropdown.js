import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SquarePen, Trash2 } from "lucide-react";
import Modal from "./Modal";
import DailyNarrativeEditForm from "./DailyNarrativeEditForm";
import DailyNarrativeDelete from "./DailyNarrativeDelete";

function DailyNarrativeDropdown({ trigger, narrative }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Select option</DropdownMenuLabel>
          <DropdownMenuRadioGroup className={"flex flex-col pb-1"}>
            <Modal
              title={"Update your narrative"}
              description="Do you want to change something?"
              trigger={
                <div className="flex gap-2 items-center py-1 px-2 text-sm text-stone-600 font-semibold rounded-sm hover:bg-stone-100 transition-colors">
                  <SquarePen size={16} /> Edit
                </div>
              }
            >
              <DailyNarrativeEditForm narrative={narrative} />
            </Modal>
            <Modal
              title={<span className={`text-red-600`}>Delete Narrative</span>}
              trigger={
                <div className="flex gap-2 items-center py-1 px-2 text-sm text-stone-600 font-semibold rounded-sm hover:bg-stone-100 transition-colors">
                  <Trash2 size={16} /> Delete
                </div>
              }
              description={`Are you sure you want to delete this narrative?`}
            >
              <DailyNarrativeDelete narrativeId={narrative.id} />
            </Modal>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DailyNarrativeDropdown;
