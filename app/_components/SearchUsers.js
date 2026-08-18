"use client";

import HistoryLoadingCard from "./HistoryLoadingCard";
import SearchedUsersHistoryList from "./SearchedUsersHistoryList";
import UsersSearchBar from "./UsersSearchBar";
import { useState } from "react";
import { useApiFetch } from "../_services/helpers";
import SearchedUserList from "./SearchedUserList";

function SearchUsers({ historyData = [] }) {
  const [inputValue, setInputValue] = useState("");

  const apiEndpoint =
    inputValue.trim().length > 2
      ? `/api/users?q=${encodeURIComponent(inputValue.trim())}`
      : null;

  const { data, loading, error } = useApiFetch(apiEndpoint, 500);

  const searchedUsers = data?.success ? data.users : [];

  console.log("Searched users: ", searchedUsers);

  const isEmpty = searchedUsers.length === 0;
  const isHistoryEmpty = historyData.length === 0;

  return (
    <>
      <UsersSearchBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        loading={loading}
      />

      {!isEmpty || !isHistoryEmpty ? null : <HistoryLoadingCard />}

      {inputValue.trim().length > 2 && !isEmpty && (
        <SearchedUserList searchedUsers={searchedUsers} />
      )}

      {inputValue.trim().length > 2 || isHistoryEmpty || loading ? null : (
        <SearchedUsersHistoryList historyData={historyData} />
      )}

      {/* <SearchedUsersHistoryList historyData={historyData} /> */}
    </>
  );
}

export default SearchUsers;
