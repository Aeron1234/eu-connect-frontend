"use client";

import { Spinner } from "@/components/ui/spinner";
import { UserPlus } from "lucide-react";
import AccountIdentityFields from "./AccountIdentityFields";
import AccountCredentialsFields from "./AccountCredentialsFields";
import AccountAssignmentFields from "./AccountAssignmentFields";
import useCreateAccountForm from "./useCreateAccountForm";

function CreateAccountForm({ roles, courses, departments, onCreated }) {
  const {
    handleAction, isPending, showConditionalRow,
    identityProps, credentialsProps, assignmentProps,
  } = useCreateAccountForm({ roles, courses, departments, onCreated });

  return (
    <form className="flex-1 text-sm flex flex-col gap-4" action={handleAction}>
      <AccountIdentityFields {...identityProps} />

      <AccountCredentialsFields {...credentialsProps} />

      {showConditionalRow && (
        <AccountAssignmentFields {...assignmentProps} />
      )}

      <div className="h-full flex items-end justify-end mt-4">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? (
            <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
          ) : (
            <>
              <span>
                <UserPlus className="h-5 w-5" />
              </span>{" "}
              Create Account
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CreateAccountForm;
