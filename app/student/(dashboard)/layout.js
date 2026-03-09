import PageContainer from "@/app/_components/PageContainer";
import { auth } from "@/app/_services/auth";
import { Spinner } from "@/components/ui/spinner";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function layout({ children, narratives, dtr, calendar, doughnut }) {
  const session = await auth();
  if (!session?.user) return notFound();

  const role = session.user.role;
  if (role !== "student") return notFound();

  return (
    <PageContainer>
      <Suspense
        fallback={
          <div className="self-center justify-self-center p-5">
            <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
          </div>
        }
      >
        {children}
      </Suspense>

      <div className="flex gap-4 h-full">
        <div className="flex-1 gap-4 flex flex-col h-full">
          <div className="bg-white rounded-md p-4 shadow-sm flex flex-col gap-4 flex-1">
            <Suspense
              fallback={
                <div className="self-center justify-self-center p-5">
                  <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
                </div>
              }
            >
              {dtr}
            </Suspense>
          </div>

          <div className="bg-white rounded-md p-4 shadow-sm flex flex-col gap-4 h-full flex-1">
            <Suspense
              fallback={
                <div className="self-center justify-self-center p-5">
                  <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
                </div>
              }
            >
              {narratives}
            </Suspense>
          </div>
        </div>
        {/* <div className="hidden xl:flex flex-row xl:flex-col gap-4 h-fit"> */}
        <div className="flex max-lg:hidden flex-col gap-4 h-fit">
          <div className="items-center flex">
            <Suspense
              fallback={
                <div className="self-center justify-self-center p-5">
                  <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
                </div>
              }
            >
              {calendar}
            </Suspense>
          </div>

          <div className="flex-1">
            <Suspense
              fallback={
                <div className="self-center justify-self-center p-5">
                  <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
                </div>
              }
            >
              {doughnut}
            </Suspense>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default layout;
