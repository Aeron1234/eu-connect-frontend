"use client";

import { History, X } from "lucide-react";
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
} from "../_services/general-actions";
import UserCard from "./UserCard";

function SearchedUsersHistoryList({ historyData = [] }) {
  async function handleClearHistory() {
    try {
      await clearSearchHistory({ type: "user" });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 justify-between text-stone-500 mb-2">
        <h3 className="flex items-center gap-1">
          <History className="h-4 w-4 text-primary-500" /> Recently Viewed
        </h3>

        <button
          className="hover:text-stone-800 cursor-pointer text-sm"
          onClick={handleClearHistory}
        >
          clear all
        </button>
      </div>
      {historyData.length > 0 && (
        <ul className="w-full flex flex-col gap-2">
          {historyData.map((history) => (
            <li className="w-full" key={history.history_id}>
              <SearchedUserHistoryItem history={history} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchedUserHistoryItem({ history }) {
  async function handleDelete() {
    try {
      await deleteSearchHistoryItem({
        type: "user",
        historyId: history.history_id,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <UserCard
      userId={history.searched_uuid}
      firstName={history.first_name}
      lastName={history.last_name}
      role={history.role}
      course={history.course}
      companyName={history.company_name}
      totalHours={history.total_hours}
      hoursRendered={history.hours_rendered}
      department={history.department}
      avatar={history.avatar}
      actions={
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove from history"
        >
          <X className="w-4 h-4" />
        </button>
      }
    />
  );
}

export default SearchedUsersHistoryList;
