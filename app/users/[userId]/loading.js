import SearchedUserHeaderSkeleton from "@/components/skeletons/SearchedUserHeaderSkeleton";
import SearchedUserFilterSkeleton from "@/components/skeletons/SearchedUserFilterSkeleton";

function UserProfileLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <SearchedUserHeaderSkeleton />
      <SearchedUserFilterSkeleton />
    </main>
  );
}

export default UserProfileLoading;
