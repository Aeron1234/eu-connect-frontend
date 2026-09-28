"use client";

import HistoryLoadingCard from "./HistoryLoadingCard";
import SearchedUsersHistoryList from "./SearchedUsersHistoryList";
import UsersSearchBar from "./UsersSearchBar";
import SearchedUserEmpty from "./SearchedUserEmpty";
import { useState } from "react";
import { useApiFetch } from "@/lib/helpers";
import SearchedUserList from "./SearchedUserList";

function SearchUsers({ historyData = [] }) {
  const [inputValue, setInputValue] = useState("");

  const trimmed = inputValue.trim();
  const isSearching = trimmed.length > 2;

  const apiEndpoint = isSearching
    ? `/api/users?q=${encodeURIComponent(trimmed)}`
    : null;

  const { data, loading, error } = useApiFetch(apiEndpoint, 500);

  const searchedUsers = data?.success ? data.users : [];

  // Only trust "no results" once we're not mid-debounce/fetch and there's no error.
  const hasNoResults =
    isSearching && !loading && !error && searchedUsers.length === 0;

  const hasResults =
    isSearching && !loading && !error && searchedUsers.length > 0;

  const isHistoryEmpty = historyData.length === 0;

  return (
    <>
      <UsersSearchBar inputValue={inputValue} setInputValue={setInputValue} />

      {/* Not searching yet, and no history -> prompt to start */}
      {!isSearching && isHistoryEmpty && <HistoryLoadingCard />}

      {/* Not searching yet, but history exists -> show history */}
      {!isSearching && !isHistoryEmpty && (
        <SearchedUsersHistoryList historyData={historyData} />
      )}

      {/* Actively searching (covers debounce wait + fetch) */}
      {isSearching && loading && (
        <p className="text-sm text-stone-400 text-center py-8">Searching…</p>
      )}

      {isSearching && !loading && error && (
        <p className="text-sm text-red-500 text-center py-8">
          Something went wrong while searching. Please try again.
        </p>
      )}

      {hasResults && <SearchedUserList searchedUsers={searchedUsers} />}

      {hasNoResults && <SearchedUserEmpty query={trimmed} />}
    </>
  );
}

export default SearchUsers;
