import { Spinner } from "@/components/ui/spinner";

function Loading() {
  return (
    <div className="w-full flex justify-center">
      <Spinner className={"size-8 stroke-3 stroke-stone-400"} />
    </div>
  );
}

export default Loading;
