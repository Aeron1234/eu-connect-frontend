import InfoCardSkeleton from "./InfoCardSkeleton";

function InfoCardsGridSkeleton({ cards = 2 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: cards }).map((_, i) => (
        <InfoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default InfoCardsGridSkeleton;
