import { Button } from "@/components/ui/button.jsx";
import { SquarePen } from "lucide-react";

function AccountPersonalInfo({ children }) {
  return (
    <div className="bg-white shadow-sm rounded-md p-4 flex flex-col gap-2">
      <div className="flex justify-between">
        <h2 className="text-base font-semibold">Personal Information</h2>
        <Button
          className={"bg-primary-500 hover:bg-primary-400 cursor-pointer w-fit"}
        >
          <SquarePen /> <span>Edit</span>
        </Button>
      </div>

      {children}
    </div>
  );
}

export default AccountPersonalInfo;
