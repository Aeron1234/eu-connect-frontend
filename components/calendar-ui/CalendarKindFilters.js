"use client";

export default function CalendarKindFilters({ activeKinds, visible, setVisible }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-border px-3 py-3 sm:px-5">
      {activeKinds.map((kind) => <label
          key={kind.id}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-foreground-soft"
        >
          <input
            type="checkbox"
            checked={visible[kind.id]}
            onChange={(event) => setVisible((old) => ({ ...old, [kind.id]: event.target.checked }))}
            className="accent-primary"
          />
          <span className={`size-2 rounded-full ${kind.dot}`} />
          {kind.label}
        </label>)}
    </div>
  );
}
