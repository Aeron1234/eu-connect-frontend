import { Bell } from "lucide-react";
import PageContainer from "../_components/PageContainer";
import PageTitle from "../_components/PageTitle";
import { getInbox, getUserSession } from "../_services/services";
import NotificationList from "../_components/NotificationList";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Notifications",
};

async function NotificationsPage({ searchParams }) {
  const inboxData = await getInbox();

  const unreadCount = inboxData?.unreadCount || 0;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary-500" />
            Notifications
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Approvals, announcements, and system updates
          </p>
        </div>

        {unreadCount > 0 && (
          <Suspense
            fallback={
              <div className="self-center justify-self-center p-5">
                <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
              </div>
            }
          >
            <div className="bg-primary-500 text-white font-bold px-3 py-1 rounded-full text-xs tracking-wide self-start">
              {unreadCount} unread
            </div>
          </Suspense>
        )}
      </div>

      <div className="rounded-xl bg-white border border-stone-200 shadow-sm flex-1 py-4 px-8 flex flex-col gap-4">
        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <NotificationList inboxData={inboxData} />
        </Suspense>
      </div>
    </main>
  );
}

export default NotificationsPage;
