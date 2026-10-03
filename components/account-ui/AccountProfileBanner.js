"use client";

import { useState } from "react";
import { User, Pencil } from "lucide-react";
import AvatarPicker from "./AvatarPicker";
import Image from "next/image";

function AccountProfileBanner({
  name,
  isEditing,
  isNameEditable,
  onNameChange,
  subtitle,
  avatar: initialAvatar = null,
}) {
  const [avatar, setAvatar] = useState(initialAvatar);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="h-14 sm:h-20 bg-primary" />

      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 -mt-7 sm:-mt-10">
          <div className="relative shrink-0">
            <div className="shadow-lg w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-muted border-2 border-card overflow-hidden flex items-center justify-center text-foreground-subtle">
              {avatar ? (
                <img
                  src={`/avatars/${avatar}`}
                  alt="Avatar option"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 sm:w-9 sm:h-9" />
              )}
            </div>

            <AvatarPicker
              currentAvatar={avatar}
              onAvatarChange={setAvatar}
              trigger={
                <div
                  aria-label="Change avatar"
                  title="Change avatar"
                  className="absolute bottom-6 -right-1 flex h-3 w-3 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-primary-emphasis hover:border-primary-300 shadow-lg cursor-pointer transition-colors"
                >
                  <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
              }
            />
          </div>

          <div className="flex-1 min-w-0 pb-1">
            {isEditing && isNameEditable ? (
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full max-w-xs rounded-md border border-input bg-background px-2 py-1 text-base sm:text-lg font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                {name}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountProfileBanner;
