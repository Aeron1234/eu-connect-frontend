"use client";

import { saveSearchHistory } from "@/lib/server-actions/history-actions";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { searchUsersKeys } from "@/lib/cache/search-users-queries";
import UserCard from "./UserCard";

function SearchedUserItem({ searchedUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();

  async function handleSaveHistory(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    try {
      const result = await saveSearchHistory({
        type: "user",
        searchedUUID: searchedUser.user_id,
      });
      if (result?.success && user?.id) {
        void queryClient.invalidateQueries({ queryKey: searchUsersKeys.history(user.id) });
      }
    } catch (err) {
      console.error(err);
    } finally {
      router.push(`/users/${searchedUser.user_id}`);
    }
  }

  return (
    <UserCard
      userId={searchedUser.user_id}
      firstName={searchedUser.first_name}
      lastName={searchedUser.last_name}
      role={searchedUser.role}
      course={searchedUser.course}
      companyName={searchedUser.company_name}
      totalHours={searchedUser.total_hours}
      hoursRendered={searchedUser.hours_rendered}
      department={searchedUser.department}
      avatar={searchedUser.avatar}
      onClick={handleSaveHistory}
    />
  );
}

export default SearchedUserItem;
