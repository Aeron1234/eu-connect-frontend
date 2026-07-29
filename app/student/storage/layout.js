import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

function StorageLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="self-center justify-self-center p-5">
          <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">{children}</div>
    </Suspense>
  );
}

export default StorageLayout;
