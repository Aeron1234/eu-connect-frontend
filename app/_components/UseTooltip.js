import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function UseTooltip({ children, side, label, className }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className={`p-0 rounded-sm border-0 shadow-none ${className}`}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="bg-white text-stone-800 shadow-lg font-semibold"
      >
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default UseTooltip;
