import ActivityLogsManager from "@/app/_components/ActivityLogsManager";
import { getAllActivityLogs } from "@/app/_services/admin-actions";

export const metadata = {
  title: "Activity Logs",
};

async function ActivityLogsPage() {
  const logsData = await getAllActivityLogs({});

  return (
    <ActivityLogsManager
      initialData={logsData?.data || []}
      filters={
        logsData?.filters || { actions: [], actorRoles: [], targetTypes: [] }
      }
      pagination={logsData?.pagination || {}}
    />
  );
}

export default ActivityLogsPage;
