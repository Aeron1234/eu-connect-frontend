"use client";

import { saveSearchHistory } from "@/lib/server-actions/history-actions";
import { useRouter } from "next/navigation";
import UserCard from "./UserCard";

function SearchedUserItem({ searchedUser }) {
  const router = useRouter();

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
      await saveSearchHistory({
        type: "user",
        searchedUUID: searchedUser.user_id,
      });
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
