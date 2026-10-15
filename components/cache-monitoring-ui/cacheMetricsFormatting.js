const number = new Intl.NumberFormat();

const count = (value) => number.format(Number(value) || 0);

const percent = (value) => value == null ? "No data yet" : `${Math.round(value * 100)}%`;

const bytes = (value) => {
  const size = Number(value) || 0;
  if (size < 1024) return `${count(size)} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const dateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
};

const duration = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return [days && `${days}d`, hours && `${hours}h`, `${minutes}m`].filter(Boolean).join(" ");
};

const skipFields = [
  ["Non-success response", "skip_status"],
  ["Controller opted out", "skip_opt_out"],
  ["Set-Cookie response", "skip_cookie"],
  ["Invalidated during read", "skip_generation"],
  ["Response too large", "skip_oversized"],
  ["Could not serialize", "skip_serialization"],
];

const bypasses = (row) => row.bypass_method + row.bypass_identity + row.bypass_disabled;

export { count, percent, bytes, dateTime, duration, skipFields, bypasses };
