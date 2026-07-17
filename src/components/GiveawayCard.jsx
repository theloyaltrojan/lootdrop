import { parseWorth, tier, formatExpiry } from "../utils";

export default function GiveawayCard({ giveaway }) {
  const g = giveaway;
  const worth = parseWorth(g.worth);
  const t = tier(worth);
  const platforms = (g.platforms || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const rawType = (g.type || "Game").toLowerCase();
  const typeLabel = rawType.includes("loot")
    ? "Loot"
    : rawType.includes("beta")
      ? "Beta"
      : "Game";
  const exp = formatExpiry(g.end_date);
  const worthText = worth ? `$${worth.toFixed(2)}` : "FREE";
  const worthClass =
    t === "legendary" ? "legendary" : !worth ? "free" : "";
  const users = g.users ? g.users.toLocaleString() + " claimed" : "";

  return (
    <article className={`card tier-${t}`}>
      <div className="thumb">
        <img
          src={g.thumbnail}
          alt={g.title}
          loading="lazy"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <span className={`type-tag ${typeLabel.toLowerCase()}`}>
          {typeLabel}
        </span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{g.title}</h3>
        <div className="platforms">
          {platforms.slice(0, 4).map((p) => (
            <span key={p} className="platform">
              {p}
            </span>
          ))}
        </div>
        <div className="worth-row">
          <span className={`worth ${worthClass}`.trim()}>{worthText}</span>
          <span className={`expiry ${exp.urgent ? "urgent" : ""}`.trim()}>
            {exp.text}
          </span>
        </div>
        <a
          className="claim"
          href={g.open_giveaway_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Claim now →
        </a>
      </div>
      <div className="card-footer">
        <span>{users}</span>
        <span>#{g.id}</span>
      </div>
    </article>
  );
}
