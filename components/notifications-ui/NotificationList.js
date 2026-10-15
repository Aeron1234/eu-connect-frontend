"use client";

import { Inbox } from "lucide-react";
import ErrorUI from "@/components/ui/ErrorUI";
import NotificationItemSkeleton from "@/components/skeletons/NotificationItemSkeleton";
import { notifyNotificationsChanged } from "@/lib/notification-events";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import NotificationItem from "./NotificationItem";
import NotificationInboxStats from "./NotificationInboxStats";
import useNotificationInbox from "./useNotificationInbox";

const scopeTabs = [
  { label: "All", value: "all" },
  { label: "Requests", value: "requests" },
];

function NotificationList({ inboxData: initialData }) {
  const {
    isEmployer, scope, setScope, selectedScope, inboxQuery,
    notifications, totalRecords, unreadCount, isLoadingMore,
  } = useNotificationInbox(initialData);

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-wrap items-center gap-3">
        {isEmployer && (
          <div className="flex rounded-lg bg-secondary p-1 w-fit">
            {scopeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setScope(tab.value)}
                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  scope === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-primary-emphasis"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="w-fit ml-auto">
          <MarkAllAsReadButton
            data={notifications}
            unreadCount={unreadCount}
            onChanged={notifyNotificationsChanged}
          />
        </div>
      </div>

      <NotificationInboxStats totalRecords={totalRecords} unreadCount={unreadCount} selectedScope={selectedScope} inboxQuery={inboxQuery} />

      {inboxQuery.isPending ? (
        <div className="flex flex-col gap-2" role="status" aria-label="Loading notifications">
          {Array.from({ length: 5 }, (_, index) => <NotificationItemSkeleton key={index} />)}
        </div>
      ) : inboxQuery.isError && !inboxQuery.data ? (
        <ErrorUI error={inboxQuery.error} reset={() => void inboxQuery.refetch()} logError={false} />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <Inbox className="size-8 text-foreground-faint" />
          <p className="text-sm font-medium text-muted-foreground">
            {selectedScope === "requests" ? "No supervisor requests right now" : "You're all caught up"}
          </p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            {selectedScope === "requests"
              ? "New requests from students will show up here."
              : "New approvals, announcements, and updates will show up here."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((item) => (
            <li key={`${item.ui_key || item.id}:${Boolean(item.actionable)}`} className="flex-1">
              <NotificationItem item={item} onChanged={notifyNotificationsChanged} />
            </li>
          ))}
        </ul>
      )}

      {inboxQuery.hasNextPage && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => void inboxQuery.fetchNextPage()}
            disabled={isLoadingMore}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationList;
