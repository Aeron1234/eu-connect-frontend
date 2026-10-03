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
  const [historyState, setHistoryState] = useState({
    source: historyData,
    items: historyData,
  });

  // A server refresh can bring newer history after a save or another mutation.
  if (historyState.source !== historyData) {
    setHistoryState({ source: historyData, items: historyData });
  }

  const history =
    historyState.source === historyData ? historyState.items : historyData;

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

  const isHistoryEmpty = history.length === 0;

  function handleHistoryDelete(historyId) {
    setHistoryState((current) => ({
      ...current,
      items: current.items.filter((item) => item.history_id !== historyId),
    }));
  }

  function handleHistoryClear() {
    setHistoryState((current) => ({ ...current, items: [] }));
  }

  return (
    <>
      <UsersSearchBar inputValue={inputValue} setInputValue={setInputValue} />

      {/* Not searching yet, and no history -> prompt to start */}
      {!isSearching && isHistoryEmpty && <HistoryLoadingCard />}

      {/* Not searching yet, but history exists -> show history */}
      {!isSearching && !isHistoryEmpty && (
        <SearchedUsersHistoryList
          historyData={history}
          onDelete={handleHistoryDelete}
          onClear={handleHistoryClear}
        />
      )}

      {/* Actively searching (covers debounce wait + fetch) */}
      {isSearching && loading && (
        <p className="text-sm text-foreground-subtle text-center py-8">
          Searching…
        </p>
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
