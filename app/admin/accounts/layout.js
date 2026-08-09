import { getUserSession } from "@/app/_services/services";
import { Spinner } from "@/components/ui/spinner";
import { notFound } from "next/navigation";
import { Suspense } from "react";

function AccountLayout({ children }) {
  // const session = await getUserSession();
  // if (!session?.user) return notFound();

  // const role = session.user.role;
  // if (role !== "student") return notFound();

  return (
    <Suspense
      fallback={
        <div className="self-center justify-self-center p-5">
          <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default AccountLayout;
