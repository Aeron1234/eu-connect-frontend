import { ArrowLeft } from "lucide-react";
import AccountPageHeaderSkeleton from "@/components/skeletons/AccountPageHeaderSkeleton";
import AccountProfileBannerSkeleton from "@/components/skeletons/AccountProfileBannerSkeleton";
import InfoCardsGridSkeleton from "@/components/skeletons/InfoCardsGridSkeleton";
import SecurityCardSkeleton from "@/components/skeletons/SecurityCardSkeleton";
import AccountSummaryCardSkeleton from "@/components/skeletons/AccountSummaryCardSkeleton";

function AccountLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <span className="inline-flex items-center gap-2 text-sm text-foreground-subtle mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </span>

      <AccountPageHeaderSkeleton />

      <div className="space-y-6">
        <AccountProfileBannerSkeleton />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <InfoCardsGridSkeleton />
          </div>

          <aside className="space-y-6">
            <SecurityCardSkeleton />
            <AccountSummaryCardSkeleton />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AccountLoading;
