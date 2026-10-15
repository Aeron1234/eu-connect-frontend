"use client";



export default function AnnexCEntriesTable({ report: r }) {
  return (
<>
      {r.entries?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-t border-b border-border text-left text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 sm:px-5 py-3 font-medium">
                  Issues &amp; Concerns
                </th>
                <th className="px-4 sm:px-5 py-3 font-medium">
                  Solutions
                </th>
                <th className="px-4 sm:px-5 py-3 font-medium">
                  Recommendations
                </th>
              </tr>
            </thead>
            <tbody>
              {r.entries.map((e, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 sm:px-5 py-3 text-foreground">
                    {e.issue}
                  </td>
                  <td className="px-4 sm:px-5 py-3 text-foreground">
                    {e.solution}
                  </td>
                  <td className="px-4 sm:px-5 py-3 text-foreground">
                    {e.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
                      {!r.entries?.length && (
        <p className="border-t border-border px-4 py-4 text-sm text-muted-foreground sm:px-5">
          No issues, solutions, or recommendations were saved for this report.
        </p>
      )}
</>
  );
}
