import SearchedUserHeaderSkeleton from "@/app/_components/SearchedUserHeaderSkeleton";
import SearchedUserFilterSkeleton from "@/app/_components/SearchedUserFilterSkeleton";

function UserProfileLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <SearchedUserHeaderSkeleton />
      <SearchedUserFilterSkeleton />
    </main>
  );
}

export default UserProfileLoading;
