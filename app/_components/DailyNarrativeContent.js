import { Ellipsis } from "lucide-react";
import DailyNarrativeDropdown from "./DailyNarrativeDropdown";
import TriggerButton from "./TriggerButton";
import { Button } from "@/components/ui/button";

function DailyNarrativeContent({ narrative }) {
  const narrativeText =
    narrative.narrative.length >= 400
      ? narrative.narrative.split(" ").slice(0, 50).join(" ") + "..."
      : narrative.narrative;

  return (
    <>
      <header className="flex gap-1 justify-between">
        <h3 className="font-bold text-stone-500 text-xs">
          Day {narrative.day_number}
        </h3>

        <DailyNarrativeDropdown
          trigger={<TriggerButton icon={<Ellipsis size={18} />} type="mini" />}
          narrative={narrative}
          isTextLong={narrative.narrative.length >= 400}
        />
      </header>

      <span className="font-bold">{narrative.title}</span>

      <p className="text-sm h-full max-h-45 overflow-y-scroll">
        {narrativeText}
      </p>
    </>
  );
}

export default DailyNarrativeContent;
