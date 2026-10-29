// Old records may contain a bare domain or malformed text. Link only HTTP(S)
// addresses, so rendering saved data cannot introduce executable URL schemes.
export function companyWebsiteHref(value) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input || /\s/.test(input)) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.hostname.includes(".") ? url.href : null;
  } catch { return null; }
}
