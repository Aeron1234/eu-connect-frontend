import { Ellipsis } from "lucide-react";
import DailyNarrativeDropdown from "../app/_components/DailyNarrativeDropdown";
import TriggerButton from "../app/_components/TriggerButton";
import Modal from "../app/_components/Modal";

function DailyNarrativeContent({ narrative }) {
  const isLongText = narrative.narrative.length >= 300;

  // Use a cleaner slice method for the excerpt
  const narrativeExcerpt = isLongText
    ? narrative.narrative.substring(0, 250) + "..."
    : narrative.narrative;
  return (
    <>
      <header className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
            Timeline
          </span>
          <h3 className="font-bold text-primary-500 text-sm">
            Day {narrative.day_number}
          </h3>
        </div>

        <DailyNarrativeDropdown
          trigger={
            // <TriggerButton
            //   icon={}
            //   type="mini"
            //   className="hover:bg-stone-100 rounded-full transition-colors"
            // />
            <Ellipsis className="h-5 w-5" />
          }
          narrative={narrative}
          isTextLong={isLongText}
        />
      </header>

      {/* 2. Content Section */}
      <div className="space-y-2 grow">
        <h4 className="font-extrabold text-stone-800 leading-tight tracking-tight text-sm">
          {narrative.title}
        </h4>

        <div className="relative">
          <p className="text-sm leading-relaxed text-stone-600 line-clamp-4 max-sm:text-xs">
            {isLongText ? narrativeExcerpt : narrative.narrative}
          </p>

          {isLongText && (
            <Modal
              title={`Day ${narrative.day_number}: Narrative Report`}
              description={
                <span className="text-lg font-bold text-stone-900 block">
                  {narrative.title}
                </span>
              }
              trigger={
                <div className="mt-2 text-xs font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-all flex items-center gap-1">
                  Read full narrative
                </div>
              }
            >
              <div className="mt-2 text-stone-700 whitespace-pre-wrap max-h-[60vh] leading-relaxed overflow-y-auto pr-2 text-sm">
                {narrative.narrative}
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
}

export default DailyNarrativeContent;
