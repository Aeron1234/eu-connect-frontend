import SearchedUserHeaderSkeleton from "@/components/skeletons/SearchedUserHeaderSkeleton";
import SearchedUserFilterSkeleton from "@/components/skeletons/SearchedUserFilterSkeleton";

function UserProfileLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <SearchedUserHeaderSkeleton />
      <SearchedUserFilterSkeleton />
    </div>
  );
}

export default UserProfileLoading;
