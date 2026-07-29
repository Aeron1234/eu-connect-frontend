"use client";

import Link from "next/link";
import { saveSearchHistory } from "../_services/general-actions";

function SearchedUserItem({ user }) {
  async function handleSaveHistory() {
    try {
      await saveSearchHistory({ type: "user", searchedUUID: user.user_id });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      onClick={handleSaveHistory}
      className="group relative w-full bg-white rounded-xl border border-stone-200 shadow-sm hover:border-primary-500/30 transition-all"
    >
      <Link
        href={`/users/${user.user_id}`}
        className="inline-block w-full p-4 text-left"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-primary-500 text-lg font-semibold shrink-0">
            {user.first_name.charAt(0).toUpperCase()}
            {user.last_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">
              {user.first_name} {user.last_name}
            </h3>
            {user?.course && (
              <p className="text-sm text-muted-foreground">{user.course}</p>
            )}

            {user.role === "employer" && user?.company_name ? (
              <p className="text-sm text-muted-foreground">
                {user.company_name}
              </p>
            ) : null}
          </div>
          {user.role === "student" && (
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-primary-500">
                {user.hours_rendered.toFixed(2)}/{user.total_hours} hrs
              </p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default SearchedUserItem;
