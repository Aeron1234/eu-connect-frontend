"use clien";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormStatus } from "react-dom";

function SubmitButton({ text }) {
  return (
    <Button
      className={"bg-primary-500 hover:bg-primary-400 w-fit "}
      type="submit"
      disabled={isPending}
    >
      {isPending ? (
        <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
      ) : (
        text
      )}
    </Button>
  );
}

export default SubmitButton;
