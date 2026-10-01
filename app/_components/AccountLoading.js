import { ArrowLeft } from "lucide-react";
import AccountPageHeaderSkeleton from "@/app/_components/AccountPageHeaderSkeleton";
import AccountProfileBannerSkeleton from "@/app/_components/AccountProfileBannerSkeleton";
import InfoCardsGridSkeleton from "@/app/_components/InfoCardsGridSkeleton";
import SecurityCardSkeleton from "@/app/_components/SecurityCardSkeleton";
import AccountSummaryCardSkeleton from "@/app/_components/AccountSummaryCardSkeleton";

function AccountLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
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
    </main>
  );
}

export default AccountLoading;
