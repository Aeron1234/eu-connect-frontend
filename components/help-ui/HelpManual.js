"use client";

import { useUser } from "@/contexts/UserContext";
import ManualDialog from "@/components/ui/ManualDialog";
import { getPageGuide } from "./helpContent";

export default function HelpManual({ guideId, title, onBrand = false, triggerStyles }) {
  const { user } = useUser();
  const guide = getPageGuide(user, guideId);
  if (!guide) return null;
  return (
    <ManualDialog title={title || guide.title} onBrand={onBrand} triggerStyles={triggerStyles}>
      <div className="min-w-0 space-y-4 break-words text-sm leading-relaxed text-foreground">
        <p className="text-foreground-soft">{guide.summary}</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          {guide.steps.map(step => <li key={step}>{step}</li>)}
        </ol>
      </div>
    </ManualDialog>
  );
}
