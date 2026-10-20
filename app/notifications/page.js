import { Bell } from "lucide-react";
import NotificationList from "../../components/notifications-ui/NotificationList";
import PageTitle from "../../components/ui/PageTitle";

export const metadata = {
  title: "Notifications",
};

function NotificationsPage() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={Bell}
          title={"Notifications"}
          description={"Approvals, announcements, and system updates."}
        />
      </div>

      <NotificationList />
    </div>
  );
}

export default NotificationsPage;
