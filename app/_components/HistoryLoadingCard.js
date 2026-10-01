import { History } from "lucide-react";

function HistoryLoadingCard() {
  return (
    <div className="w-full flex flex-col items-center gap-4 px-4 py-8 rounded-xl border border-border bg-card text-foreground-subtle shadow-sm">
      <span className="">
        <History className="h-12 w-12" />
      </span>
      <div className="text-center">
        <p className="text-lg">No search history yet.</p>
        <p className="text-sm">
          Search and open a student to start building your history.
        </p>
      </div>
    </div>
  );
}

export default HistoryLoadingCard;
