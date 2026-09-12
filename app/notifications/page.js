import { Bell } from "lucide-react";
import { getInbox } from "../_services/services";
import NotificationList from "../_components/NotificationList";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import PageTitle from "../_components/PageTitle";

export const metadata = {
  title: "Notifications",
};

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

      <Suspense
        fallback={
          <div className="self-center justify-self-center p-5">
            <span className="sr-only">Loading notifications...</span>
            <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
          </div>
        }
      >
        <NotificationList inboxData={inboxData} />
      </Suspense>
    </main>
  );
}

export default NotificationsPage;
