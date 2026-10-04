import { withReadErrorPage } from "@/lib/page-read-error";
import { Bell } from "lucide-react";
import { getInbox } from "@/lib/server-actions/notifications-actions";
import NotificationList from "../../components/notifications-ui/NotificationList";
import PageTitle from "../../components/ui/PageTitle";

export const metadata = {
  title: "Notifications",
};

export const dynamic = "force-dynamic";

async function NotificationsPage() {
  const inboxData = await getInbox({ scope: "all" });

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={Bell}
          title={"Notifications"}
          description={"Approvals, announcements, and system updates."}
        />
      </div>

      <NotificationList inboxData={inboxData} />
    </main>
  );
}

export default withReadErrorPage(NotificationsPage);
