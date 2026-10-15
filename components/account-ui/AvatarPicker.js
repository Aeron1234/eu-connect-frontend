"use client";

import { useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { avatarChoicesOptions } from "@/lib/cache/avatar-queries";
import { accountProfileKeys } from "@/lib/cache/account-profile-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "../ui/Modal";
import {
  updateUserAvatar,
  deleteUserAvatar,
} from "@/lib/server-actions/account-actions";
import { toastAndAction } from "../../lib/helpers";

function AvatarPicker({ currentAvatar, onAvatarChange, trigger }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const avatarsQuery = useQuery({
    ...avatarChoicesOptions(user?.id),
    enabled: Boolean(user?.id),
  });
  const avatars = avatarsQuery.data || [];
  const isLoading = avatarsQuery.isPending;
  const loadError = avatarsQuery.error?.message;
  const [isPending, startTransition] = useTransition();

  function handleSelect(avatarName) {
    const formData = new FormData();
    formData.append("avatar", avatarName);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Updating avatar...",
        successLabel: "Avatar updated.",
        errorLabel: "Failed to update avatar.",
        action: updateUserAvatar,
        args: [formData],
      });

      if (result?.success) {
        onAvatarChange?.(avatarName);
        void queryClient.invalidateQueries({ queryKey: accountProfileKeys.profile(user?.id) });
        router.refresh();
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Removing avatar...",
        successLabel: "Avatar removed.",
        errorLabel: "Failed to remove avatar.",
        action: deleteUserAvatar,
      });

      if (result?.success) {
        onAvatarChange?.(null);
        void queryClient.invalidateQueries({ queryKey: accountProfileKeys.profile(user?.id) });
        router.refresh();
      }
    });
  }

  return (
    <Modal variant="form"
      trigger={trigger}
      title={<span className="text-primary-emphasis">Choose Avatar</span>}
    >
      <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5" role="status" aria-label="Loading avatars">
            {Array.from({ length: 10 }, (_, index) => <Skeleton key={index} className="aspect-square w-full rounded-xl" />)}
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-lg border border-destructive/30 p-4 text-sm">
            <p>{loadError}</p>
            <button type="button" className="mt-2 font-semibold text-primary-emphasis" onClick={() => void avatarsQuery.refetch()}>
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {avatars.map((avatarName) => {
              const isSelected = currentAvatar === avatarName;
              return (
                <button
                  key={avatarName}
                  type="button"
                  onClick={() => handleSelect(avatarName)}
                  disabled={isPending}
                  className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-colors disabled:opacity-50 ${
                    isSelected
                      ? "border-primary"
                      : "border-border hover:border-border"
                  }`}
                >
                  <img
                    src={`/avatars/${avatarName}`}
                    alt="Avatar option"
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/30">
                      <Check className="h-5 w-5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {currentAvatar && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-soft hover:bg-muted transition-colors disabled:opacity-50 self-start"
          >
            <Trash2 className="h-4 w-4" />
            Remove avatar (use initials)
          </button>
        )}
      </div>
    </Modal>
  );
}

export default AvatarPicker;
