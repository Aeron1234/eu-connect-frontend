// Transform API groups and create immutable optimistic cache updates.

export function toSections(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.map((g) => ({
    id: g.category,
    title: g.category,
    items: g.items.map((i) => ({
      id: i.id,
      label: i.name,
      is_active: i.is_active,
    })),
  }));
}

export function buildFormData(fields) {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => fd.append(key, value));
  return fd;
}

// Append within an existing category; sort only when creating a new category unless
// preserveOrder is requested. Always return new changed containers for optimistic caches.
export function addToGroups(groups, category, item, preserveOrder = false) {
  if (groups.some((group) => group.category === category)) {
    return groups.map((group) => group.category === category
      ? { ...group, items: [...group.items, item] }
      : group);
  }
  const next = [...groups, { category, items: [item] }];
  return preserveOrder ? next : next.sort((a, b) => a.category.localeCompare(b.category));
}

export function setCriterionActive(groups, id, isActive) {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => item.id === id
      ? { ...item, is_active: isActive }
      : item),
  }));
}

export function setSectionActive(groups, category, isActive) {
  return groups.map((group) => group.category === category
    ? { ...group, items: group.items.map((item) => ({ ...item, is_active: isActive })) }
    : group);
}
