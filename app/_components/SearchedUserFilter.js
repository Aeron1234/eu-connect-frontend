"use client";

import TabBar from "./TabBar";

function SearchedUserFilter({ tabs, selectedTab, onSelect }) {
  return <TabBar tabs={tabs} selectedTab={selectedTab} onSelect={onSelect} />;
}

export default SearchedUserFilter;
