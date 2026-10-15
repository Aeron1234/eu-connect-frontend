"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { accountProfileKeys } from "@/lib/cache/account-profile-queries";
// Adjust this import path to wherever this server action actually lives.
import { updatePassword } from "@/lib/server-actions/account-actions";
import { toastAndAction } from "../../lib/helpers";

export default function SecurityCard({ passwordChangedAt }) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const changedDate = passwordChangedAt ? new Date(passwordChangedAt) : null;
  const lastChanged = changedDate && !Number.isNaN(changedDate.getTime())
    ? formatDistanceToNow(changedDate, { addSuffix: true })
    : null;
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSaving, startTransition] = useTransition();

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleUpdate = () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);

      const handlers = {
        loadingLabel: "Updating password...",
        successLabel: "Password was updated!",
        errorLabel: "Updating password failed.",
        action: updatePassword,
        args: [formData],
      };

      const result = await toastAndAction(handlers);

      if (!result?.success) {
        setPasswordError(result?.error || "Failed to update password.");
        return;
      }

      resetFields();
      setIsChangingPassword(false);
      await queryClient.invalidateQueries({
        queryKey: accountProfileKeys.profile(user?.id),
      });
    });
  };

  return (
    <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
        Security
      </h3>

      <div className="mt-4 rounded-lg bg-secondary/70 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-muted-foreground" /> Password
          </span>
          {!isChangingPassword ? (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="text-xs font-semibold text-primary-emphasis hover:underline"
            >
              Update
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                resetFields();
                setIsChangingPassword(false);
              }}
              disabled={isSaving}
              className="text-xs font-semibold text-muted-foreground hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>

        {isChangingPassword && (
          <div className="mt-3 space-y-2">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password, min 8 characters"
              minLength={8}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />

            {passwordError && (
              <p className="text-xs font-medium text-red-500">
                {passwordError}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save New Password"}
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {lastChanged
          ? `Last changed ${lastChanged}. We recommend changing it periodically.`
          : "No password change is recorded yet. Please change your password now to secure your account."}
      </p>
    </section>
  );
}
