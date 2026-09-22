"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Adjust this import path to wherever this server action actually lives.
import { updateUserInfo } from "../_services/general-actions";

import {
  buildName,
  buildSubtitle,
  buildCards,
  displayValue,
} from "./accountHelpers";
import AccountPageHeader from "./AccountPageHeader";
import InfoCardsGrid from "./InfoCardsGrid";
import AccountProfileBanner from "./AccountProfileBanner";
import SecurityCard from "./SecurityCard";
import AccountSummaryCard from "./AccountSummaryCard";
import { useUser } from "@/contexts/UserContext";

export default function AccountProfile({ roleLabel, userData = {} }) {
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
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary-500 mb-4 hover:underline"
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
