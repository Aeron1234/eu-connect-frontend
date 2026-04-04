import { Button } from "@/components/ui/button.jsx";
import { SquarePen } from "lucide-react";

function AccountPersonalInfo({ children }) {
  return (
    <div className="bg-white shadow-sm rounded-md p-4 flex flex-col gap-2">
      <h2 className="text-base font-semibold">Personal Information</h2>

      {children}
    </div>
  );
}

export default AccountPersonalInfo;
