import PasswordSetupShell from "@/components/auth-ui/PasswordSetupShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function PasswordSetupSkeleton() {
  return <PasswordSetupShell>
    <h1 id="password-setup-title" className="sr-only">Set your password</h1>
    <div role="status" aria-label="Loading password setup form">
      <div aria-hidden="true">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="mt-4 h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <div className="mt-7 space-y-5">
          <div><Skeleton className="h-4 w-24" /><Skeleton className="mt-2 h-11 w-full rounded-lg" /><Skeleton className="mt-2 h-4 w-4/5" /></div>
          <div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-11 w-full rounded-lg" /></div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <Skeleton className="mx-auto mt-6 h-4 w-52 max-w-full" />
        <div className="mt-6 border-t border-border pt-5"><Skeleton className="h-4 w-32" /></div>
      </div>
    </div>
  </PasswordSetupShell>;
}
