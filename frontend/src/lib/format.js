export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function reactionEmoji(type) {
  switch (type) {
    case "like":
      return "\u{1F44D}";
    case "laugh":
      return "\u{1F604}";
    case "angry":
      return "\u{1F620}";
    case "sad":
      return "\u{1F622}";
    default:
      return "❓";
  }
}

export function totalReactions(reactionsCount) {
  if (!reactionsCount) return 0;
  return ["like", "laugh", "angry", "sad"].reduce(
    (sum, key) => sum + (Number(reactionsCount[key]) || 0),
    0
  );
}
