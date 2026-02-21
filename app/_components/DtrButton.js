import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

function DtrButton() {
  return (
    <Button
      variant="default"
      className={
        "bg-green-200 hover:bg-green-100 text-green-600 hover:text-green-600 cursor-pointer rounded-md"
      }
    >
      <Clock /> <span>Clock-in</span>
    </Button>
  );
}

export default DtrButton;
