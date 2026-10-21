import { Clock3 } from "lucide-react";

export default function InternshipStartNotice({ message }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground-soft">
      <Clock3 className="mt-0.5 size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
