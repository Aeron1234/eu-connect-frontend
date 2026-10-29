"use client";

import { Spinner } from "@/components/ui/spinner";
import { ArrowRight } from "lucide-react";
import ResendAccountInvitation from "./ResendAccountInvitation";
import AccountIdentityFields from "./AccountIdentityFields";
import AccountCredentialsFields from "./AccountCredentialsFields";
import AccountAssignmentFields from "./AccountAssignmentFields";
import useCreateAccountForm from "./useCreateAccountForm";
import AccountRoleFields from "./AccountRoleFields";
import AccountFormSection from "./AccountFormSection";
import AccountFormPreview from "./AccountFormPreview";

function CreateAccountForm({ roles, courses, departments, onCreated }) {
  const {
    handleAction, isPending, creationResult, onInvitationResent, showConditionalRow, selectedRoleName,
    roleProps, identityProps, credentialsProps, assignmentProps, previewProps,
  } = useCreateAccountForm({ roles, courses, departments, onCreated });

  return (
    <form className="relative min-w-0 overflow-clip rounded-2xl border border-border bg-card text-sm shadow-sm" action={handleAction} aria-busy={isPending}>
      {creationResult && <div role="status" className="m-4 space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:m-6">
        <p>{creationResult.message}</p>
        {!creationResult.invitation_sent && <ResendAccountInvitation accountId={creationResult.accountId} onSuccess={onInvitationResent} />}
      </div>}
      <div className="border-b border-border p-5 sm:p-6">
        <AccountRoleFields {...roleProps} />
      </div>
      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-7 p-5 sm:space-y-8 sm:p-6 lg:p-7">
          <AccountFormSection number="01" title="Personal details" description="Enter the name that should appear on the account and official reports.">
            <AccountIdentityFields {...identityProps} />
          </AccountFormSection>
          <div className="border-t border-border" />
          <AccountFormSection number="02" title="Sign-in details" description="Choose the username. The account holder sets their own password through email.">
            <AccountCredentialsFields {...credentialsProps} />
          </AccountFormSection>
          {showConditionalRow && <>
            <div className="border-t border-border" />
            <AccountFormSection number="03" title={selectedRoleName === "student" ? "Academic details" : "Department assignment"} description={selectedRoleName === "student" ? "Choose the student's course and complete their academic profile." : "Choose the department this account will manage."}>
              <AccountAssignmentFields {...assignmentProps} />
            </AccountFormSection>
          </>}
        </div>
        <AccountFormPreview {...previewProps} />
      </div>
      <div className="flex flex-col gap-3 border-t border-border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground"><span className="font-semibold text-primary-emphasis">*</span> Required fields. Middle initial is optional.</p>
        <button type="submit" className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto" disabled={isPending}>
          {isPending ? <><Spinner className="size-4" /> Creating account and sending invitation...</> : <>Create account <ArrowRight className="size-4" aria-hidden="true" /></>}
        </button>
      </div>
    </form>
  );
}

export default CreateAccountForm;
