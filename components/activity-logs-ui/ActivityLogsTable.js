import ActivityLogRow from "./ActivityLogRow";

export default function ActivityLogsTable({ logs, handleDelete, isDeleting }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 sm:px-5 py-3 font-medium">User</th>
            <th className="px-4 sm:px-5 py-3 font-medium">Action</th>
            <th className="px-4 sm:px-5 py-3 font-medium">Module</th>
            <th className="px-4 sm:px-5 py-3 font-medium whitespace-nowrap">
              Timestamp
            </th>
            <th className="px-4 sm:px-5 py-3 font-medium text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <ActivityLogRow
              key={log.id}
              log={log}
              handleDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
