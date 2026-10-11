"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { accountProfileOptions, accountProfileKeys } from "@/lib/cache/account-profile-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { ArrowLeft } from "lucide-react";

// Adjust this import path to wherever this server action actually lives.
import { updateUserInfo } from "@/lib/server-actions/account-actions";

import {
  buildName,
  buildSubtitle,
  buildCards,
  displayValue,
} from "../../lib/accountHelpers";
import AccountPageHeader from "./AccountPageHeader";
import InfoCardsGrid from "./InfoCardsGrid";
import AccountProfileBanner from "./AccountProfileBanner";
import SecurityCard from "./SecurityCard";
import AccountSummaryCard from "./AccountSummaryCard";
import AccountLoading from "./AccountLoading";
import { useUser } from "@/contexts/UserContext";

function AccountProfileContent({ roleLabel, userData = {} }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const role = user.role;

  const initialName = buildName(userData);
  const initialCards = buildCards(role, userData);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [cardsData, setCardsData] = useState(() =>
    initialCards.map((card) => ({
      ...card,
      fields: card.fields.map((f) => ({ ...f })),
    })),
  );
  const [saveError, setSaveError] = useState("");
  const [isSaving, startSaveTransition] = useTransition();

  const isNameEditable = role !== "student";

  const resetToOriginal = () => {
    setName(initialName);
    setCardsData(
      initialCards.map((card) => ({
        ...card,
        fields: card.fields.map((f) => ({ ...f })),
      })),
    );
    setSaveError("");
  };

  const handleFieldChange = (cardIndex, fieldIndex, value) => {
    setCardsData((prev) => {
      const next = [...prev];
      next[cardIndex] = {
        ...next[cardIndex],
        fields: next[cardIndex].fields.map((f, i) =>
          i === fieldIndex ? { ...f, value } : f,
        ),
      };
      return next;
    });
  };

  const handleSave = () => {
    setSaveError("");

    // Only editable, key-bearing fields make it into the payload — read-only
    // fields (course, department, role/status, etc.) are never sent, even
    // though they render inside the same cards.
    const payload = {};
    cardsData.forEach((card) => {
      card.fields.forEach((f) => {
        if (f.editable && f.key) {
          payload[f.key] = f.value;
        }
      });
    });

    if (isNameEditable) {
      const trimmed = name.trim();
      const parts = trimmed.split(/\s+/).filter(Boolean);
      payload.first_name = parts[0] ?? "";
      payload.last_name = parts.slice(1).join(" ");
    }

    startSaveTransition(async () => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      const result = await updateUserInfo(null, formData);

      if (!result?.success) {
        setSaveError(result?.error || "Failed to update profile.");
        return;
      }

      setIsEditing(false);
      void queryClient.invalidateQueries({
        queryKey: dashboardOverviewKeys.role(user?.id, role),
      });
      void queryClient.invalidateQueries({
        queryKey: accountProfileKeys.profile(user?.id),
      });
      router.refresh();
    });
  };

  const handleCancel = () => {
    resetToOriginal();
    setIsEditing(false);
  };

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary-emphasis mb-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <AccountPageHeader
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
        saveError={saveError}
      />

      <div className="space-y-6">
        <AccountProfileBanner
          name={name}
          isEditing={isEditing}
          isNameEditable={isNameEditable}
          onNameChange={setName}
          subtitle={buildSubtitle(role, userData)}
          avatar={userData.avatar}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <InfoCardsGrid
              cardsData={cardsData}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
          </div>

          <aside className="space-y-6">
            <SecurityCard />
            <AccountSummaryCard
              roleLabel={roleLabel}
              status={
                userData.status
                  ? userData.status.charAt(0).toUpperCase() +
                    userData.status.slice(1)
                  : "Active"
              }
              email={displayValue(userData.email)}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function AccountProfile({ roleLabel }) {
  const { user } = useUser();
  const profileQuery = useQuery({
    ...accountProfileOptions(user?.id),
    enabled: Boolean(user?.id),
  });

  if (profileQuery.isPending) {
    return <AccountLoading />;
  }
  if (profileQuery.isError) {
    return (
      <main role="alert" className="flex-1 p-4 text-sm sm:p-6 lg:p-8">
        <p>{profileQuery.error.message}</p>
        <button type="button" onClick={() => void profileQuery.refetch()} className="mt-2 font-semibold text-primary-emphasis">Try again</button>
      </main>
    );
  }
  return <AccountProfileContent roleLabel={roleLabel} userData={profileQuery.data} />;
}
