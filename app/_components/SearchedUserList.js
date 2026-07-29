import SearchedUserItem from "./SearchedUserItem";

function SearchedUserList({ searchedUsers = [] }) {
  return (
    <div className="w-full">
      {searchedUsers.length > 0 && (
        <ul className="w-full flex flex-col gap-2">
          {searchedUsers.map((user) => (
            <li className="w-full" key={user.user_id}>
              <SearchedUserItem user={user} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchedUserList;
