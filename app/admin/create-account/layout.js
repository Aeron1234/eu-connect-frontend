import { getUserSession } from "@/app/_services/services";
import { Spinner } from "@/components/ui/spinner";
import { notFound } from "next/navigation";
import { Suspense } from "react";

function CreateAccountLayout({ children }) {
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

export default CreateAccountLayout;
