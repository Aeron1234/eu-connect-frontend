"use client";

import { saveSearchHistory } from "../_services/general-actions";
import UserCard from "./UserCard";

function SearchedUserItem({ searchedUser }) {
  async function handleSaveHistory() {
    try {
      await saveSearchHistory({
        type: "user",
        searchedUUID: searchedUser.user_id,
      });
    } catch (err) {
      console.error(err);
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
