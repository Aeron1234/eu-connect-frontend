import PageContainer from "@/app/_components/PageContainer";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

function layout({ children, narratives, dtr, calendar, doughnut }) {
  return (
    <PageContainer>
      <div className="flex gap-4 h-full max-lg:flex-col">
        <div className="flex-1 gap-4 flex flex-col h-full">
          <Suspense
            fallback={
              <div className="self-center justify-self-center p-5">
                <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
              </div>
            }
          >
            {children}
          </Suspense>

          <div className="bg-white rounded-md p-4 shadow-sm flex flex-col gap-4 flex-2">
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

          <div className="bg-white rounded-md p-4 shadow-sm flex flex-col gap-4 h-full flex-2 col-span-2">
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
        <div className="flex  flex-col gap-4 h-fit max-lg:flex-row max-xs:flex-col">
          <div className="flex-1 max-lg:flex-none">
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
