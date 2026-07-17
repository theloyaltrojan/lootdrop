export function parseWorth(w) {
  if (!w || w === "N/A") return 0;
  return parseFloat(String(w).replace(/[^0-9.]/g, "")) || 0;
}

export function tier(worth) {
  if (worth >= 40) return "legendary";
  if (worth >= 15) return "rare";
  return "common";
}

export function daysUntil(dateStr) {
  if (!dateStr || dateStr === "N/A") return null;
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d)) return null;
  return Math.ceil((d - new Date()) / 86400000);
}

export function formatExpiry(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { text: "No end date", urgent: false };
  if (days <= 0) return { text: "Ends today", urgent: true };
  if (days === 1) return { text: "1 day left", urgent: true };
  if (days <= 3) return { text: `${days} days left`, urgent: true };
  if (days <= 14) return { text: `${days} days left`, urgent: false };
  return { text: `${days}d left`, urgent: false };
}
