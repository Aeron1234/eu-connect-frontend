"use client";

import InfoCard from "./InfoCard";

export default function InfoCardsGrid({ cardsData, isEditing, onFieldChange }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {cardsData.map((card, cardIndex) => (
        <InfoCard
          key={card.title}
          card={card}
          cardIndex={cardIndex}
          isEditing={isEditing}
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  );
}
