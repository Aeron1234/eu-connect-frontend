"use client";

import { History, X } from "lucide-react";
import Link from "next/link";
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
} from "../_services/general-actions";

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
    <div className="group relative w-full bg-white rounded-xl border border-stone-200 shadow-sm hover:border-primary-500/30 transition-all">
      <Link
        href={`/users/${history.searched_uuid}`}
        className="inline-block w-full p-4 text-left"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-primary-500 text-lg font-semibold shrink-0">
            {history.first_name.charAt(0).toUpperCase()}
            {history.last_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">
              {history.first_name} {history.last_name}
            </h3>
            {history.course && (
              <p className="text-sm text-muted-foreground">{history.course}</p>
            )}

            {history.role === "employer" && history.company_name ? (
              <p className="text-sm text-muted-foreground">
                {history.company_name}
              </p>
            ) : null}
          </div>
          {history.role === "student" && (
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-primary-500">
                {history.hours_rendered.toFixed(2)}/{history.total_hours} hrs
              </p>
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove from history"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default SearchedUsersHistoryList;
