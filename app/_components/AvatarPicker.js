"use client";

import { useEffect, useState, useTransition } from "react";
import { User, Loader2, Check, Trash2 } from "lucide-react";
import Modal from "./Modal";
import {
  getAvailableAvatars,
  updateUserAvatar,
  deleteUserAvatar,
} from "../_services/general-actions";
import { toastAndAction } from "../_services/helpers";

function AvatarPicker({ currentAvatar, onAvatarChange, trigger }) {
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getAvailableAvatars().then((result) => {
      if (!cancelled) {
        setAvatars(result?.avatars || []);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelect(avatarName) {
    const formData = new FormData();
    formData.append("avatar", avatarName);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Updating avatar...",
        successLabel: "Avatar updated.",
        errorLabel: "Failed to update avatar.",
        action: updateUserAvatar,
        formData,
      });

      if (result?.success) {
        onAvatarChange?.(avatarName);
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
        formData: new FormData(),
      });

      if (result?.success) {
        onAvatarChange?.(null);
      }
    });
  }

  return (
    <Modal
      trigger={trigger}
      title={<span className="text-primary-500">Choose Avatar</span>}
      description="Pick a display picture, or remove it to use your initials instead."
    >
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
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
                      ? "border-primary-500"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <img
                    src={`/avatars/${avatarName}`}
                    alt="Avatar option"
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary-500/30">
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
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 self-start"
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
