"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import {
  searchHistoryOptions,
  searchUsersKeys,
  searchUsersOptions,
} from "@/lib/cache/search-users-queries";
import HistoryLoadingCard from "./HistoryLoadingCard";
import SearchedUsersHistoryList from "./SearchedUsersHistoryList";
import UsersSearchBar from "./UsersSearchBar";
import SearchedUserEmpty from "./SearchedUserEmpty";
import SearchedUserList from "./SearchedUserList";

function SearchUsers() {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [activeTerm, setActiveTerm] = useState("");
  const term = inputValue.trim();
  const isSearching = term.length > 2;

  const historyQuery = useQuery({
    ...searchHistoryOptions(userId),
    enabled: Boolean(userId),
  });
  const searchQuery = useQuery({
    ...searchUsersOptions(userId, activeTerm),
    enabled: Boolean(userId) && activeTerm.length > 2,
  });

  useEffect(() => {
    if (!isSearching || activeTerm === term) return;
    const timer = setTimeout(() => setActiveTerm(term), 500);
    return () => clearTimeout(timer);
  }, [activeTerm, isSearching, term]);

  function handleInputChange(value) {
    setInputValue(value);
    const nextTerm = value.trim();
    const cached = nextTerm.length > 2 && userId &&
      queryClient.getQueryData(searchUsersKeys.results(userId, nextTerm)) !== undefined;
    setActiveTerm(cached ? nextTerm : "");
  }

  function refreshHistory(update) {
    if (!userId) return;
    const queryKey = searchUsersKeys.history(userId);
    void queryClient.cancelQueries({ queryKey }).then(() => {
      queryClient.setQueryData(queryKey, (current = []) => update(current));
      void queryClient.invalidateQueries({ queryKey });
    });
  }

  const history = historyQuery.data || [];
  const isWaitingForTerm = isSearching && activeTerm !== term;
  const searchLoading = isSearching && (isWaitingForTerm || searchQuery.isPending);
  const searchError = isSearching && !isWaitingForTerm && searchQuery.isError && !searchQuery.data;
  const searchedUsers = isWaitingForTerm ? [] : searchQuery.data || [];

  return (
    <>
      <UsersSearchBar inputValue={inputValue} setInputValue={handleInputChange} />

      {!isSearching && historyQuery.isPending && (
        <p role="status" className="py-8 text-center text-sm text-foreground-subtle">
          Loading recently viewed users...
        </p>
      )}
      {!isSearching && historyQuery.isError && !historyQuery.data && (
        <div role="alert" className="py-8 text-center text-sm text-foreground-subtle">
          <p>{historyQuery.error?.message || "Could not load recently viewed users."}</p>
          <button type="button" onClick={() => void historyQuery.refetch()} className="mt-2 font-semibold text-primary-emphasis">
            Try again
          </button>
        </div>
      )}
      {!isSearching && !historyQuery.isPending && !(historyQuery.isError && !historyQuery.data) &&
        (history.length === 0 ? (
          <HistoryLoadingCard />
        ) : (
          <SearchedUsersHistoryList
            historyData={history}
            onDelete={(historyId) => refreshHistory((items) =>
              items.filter((item) => item.history_id !== historyId))}
            onClear={() => refreshHistory(() => [])}
          />
        ))}

      {searchLoading && (
        <p role="status" className="py-8 text-center text-sm text-foreground-subtle">
          Searching...
        </p>
      )}
      {!searchLoading && searchError && (
        <div role="alert" className="py-8 text-center text-sm text-red-500">
          <p>{searchQuery.error?.message || "Could not search users."}</p>
          <button type="button" onClick={() => void searchQuery.refetch()} className="mt-2 font-semibold underline">
            Try again
          </button>
        </div>
      )}
      {isSearching && !searchLoading && !searchError && searchedUsers.length > 0 && (
        <SearchedUserList searchedUsers={searchedUsers} />
      )}
      {isSearching && !searchLoading && !searchError && searchedUsers.length === 0 && (
        <SearchedUserEmpty query={term} />
      )}
    </>
  );
}

export default SearchUsers;
