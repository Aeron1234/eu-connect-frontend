import SearchedUserItem from "./SearchedUserItem";

function SearchedUserList({ searchedUsers = [] }) {
  return (
    <div className="w-full">
      <ul className="w-full flex flex-col gap-2">
        {searchedUsers.map((searchedUser) => (
          <li className="w-full" key={searchedUser.user_id}>
            <SearchedUserItem searchedUser={searchedUser} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchedUserList;
