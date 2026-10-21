import NarrativePreview from "./NarrativePreview";
import NarrativeDateRange from "./NarrativeDateRange";

function RecordsNarrative({ narrative }) {
  return (
    <li>
      <article className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              {narrative.title}
            </h2>
            <NarrativeDateRange narrative={narrative} />
          </div>
        </div>
        <NarrativePreview narrative={narrative} />
      </article>
    </li>
  );
}

export default RecordsNarrative;
