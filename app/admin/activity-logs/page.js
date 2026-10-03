import ActivityLogsManager from "@/components/activity-logs-ui/ActivityLogsManager";
import { getAllActivityLogs } from "@/lib/server-actions/activity-logs-actions";

export const metadata = {
  title: "Activity Logs",
};

export const dynamic = "force-dynamic";

async function ActivityLogsPage() {
  const logsData = await getAllActivityLogs({});

  return (
    <ActivityLogsManager
      initialData={logsData?.data || []}
      initialStats={logsData?.stats}
      filters={
        logsData?.filters || { actions: [], actorRoles: [], targetTypes: [] }
      }
      pagination={logsData?.pagination || {}}
    />
  );
}

export default ActivityLogsPage;
