"use client";

import TabBar from "./TabBar";

const tabs = [
  { value: "all", text: "All Records" },
  { value: "pending", text: "Pending Approval" },
  { value: "ongoing", text: "Ongoing" },
  { value: "finished", text: "Finished" },
  { value: "rejected", text: "Rejected" },
];

function RecordsPageFilter({ filter, onSelect, stats = {}, totalItems = 0 }) {
  return (
    <TabBar
      tabs={tabs}
      selectedTab={filter}
      onSelect={onSelect}
      getBadge={(t) =>
        t.value === "all" ? totalItems || null : stats[t.value] || null
      }
    />
  );
}

export default RecordsPageFilter;
