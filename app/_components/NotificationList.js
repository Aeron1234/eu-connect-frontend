"use client";

import { useEffect, useState } from "react";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import NotificationItem from "./NotificationItem";
import { fetchMoreNotifications } from "../_services/services";
import SeeMoreButton from "./SeeMoreButton";

function NotificationList({ inboxData: initialData }) {
  const [notifications, setNotifications] = useState(initialData?.data || []);
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [initialId, setInitialId] = useState(
    initialData?.data?.[0]?.notification_id,
  );
  const totalRecords = initialData?.totalRecords || 0;
  const unreadCount = initialData?.unreadCount || 0;

  useEffect(() => {
    const newInitialId = initialData?.data?.[0]?.notification_id;

    // ONLY reset if the very first notification is different
    // (meaning a brand new list was fetched, not just a status update)
    if (newInitialId !== initialId) {
      setNotifications(initialData?.data || []);
      setPage(1);
      setTotalPages(initialData?.totalPages || 1);
      setInitialId(newInitialId);
    } else {
      // If it's just a data refresh (like marking as read),
      // we only update the specific items without resetting the 'page' or 'See More'
      setNotifications((prev) => {
        return prev.map((item) => {
          const freshData = initialData?.data?.find(
            (d) => d.notification_id === item.notification_id,
          );
          return freshData ? { ...item, ...freshData } : item;
        });
      });
    }
  }, [initialData]);

  async function handleLoadMore() {
    setIsPending(true);
    const nextPage = page + 1;

    try {
      // Call your existing service/API
      const newData = await fetchMoreNotifications({
        page: nextPage,
      });

      setNotifications((prev) => [...prev, ...newData.data]);
      setPage(nextPage);
      setTotalPages(newData.totalPages);
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setIsPending(false);
    }
  }

  console.log(notifications);
  return (
    <>
      <div className="w-full flex justify-between">
        <div className="text-sm text-stone-600 flex flex-col">
          <h3 className="text-base font-semibold">Inbox</h3>
          {totalRecords > 0 ? (
            <span>{totalRecords} notification(s)</span>
          ) : (
            <span> </span>
          )}
        </div>

        <MarkAllAsReadButton
          data={notifications}
          unreadCount={unreadCount}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <li key={item.ui_key} className="flex-1">
              <NotificationItem
                item={item}
                notifications={notifications}
                setNotifications={setNotifications}
              />
            </li>
          ))
        ) : (
          <li>Inbox is empty</li>
        )}
      </ul>

      <SeeMoreButton
        onClick={handleLoadMore} // Changed from href to onClick
        isPending={isPending}
        currentPage={page}
        totalPages={totalPages}
        label="notification"
      />
    </>
  );
}

export default NotificationList;
