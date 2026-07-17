import { memo } from "react";
import { StarIcon } from "./icons";

function SteamDealCard({ deal, isSaved, onToggleSave }) {
  const d = deal;
  const savingsPct = Math.round(parseFloat(d.savings) || 0);
  const sale = parseFloat(d.salePrice);
  const normal = parseFloat(d.normalPrice);
  const rating = d.steamRatingText;
  const ratingPct = parseInt(d.steamRatingPercent, 10);

  const tier =
    savingsPct >= 75 ? "legendary" : savingsPct >= 40 ? "rare" : "common";

  const openUrl = `https://www.cheapshark.com/redirect?dealID=${d.dealID}`;
  const domId = `card-sd:${d.dealID}`;

  return (
    <article className={`card tier-${tier}`} id={domId}>
      <div className="thumb">
        <img
          src={d.thumb}
          alt={d.title}
          loading="lazy"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <span className="type-tag">-{savingsPct}%</span>
        <button
          type="button"
          className={"save-btn" + (isSaved ? " saved" : "")}
          onClick={() => onToggleSave(d.dealID)}
          aria-label={isSaved ? "Remove from saved" : "Save for later"}
          aria-pressed={isSaved}
          title={isSaved ? "Saved" : "Save for later"}
        >
          <StarIcon filled={isSaved} />
        </button>
      </div>
      <div className="card-body">
        <h3 className="card-title">{d.title}</h3>
        <div className="platforms">
          {rating && ratingPct > 0 && (
            <span className="platform genre">
              {rating} · {ratingPct}%
            </span>
          )}
          {parseInt(d.metacriticScore, 10) > 0 && (
            <span className="platform">MC {d.metacriticScore}</span>
          )}
        </div>
        <div className="worth-row">
          <span
            className={
              "worth" + (tier === "legendary" ? " legendary" : "")
            }
          >
            ${sale.toFixed(2)}
          </span>
          <span className="expiry sale-strike">
            ${normal.toFixed(2)}
          </span>
        </div>
        <a
          className="claim"
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get on Steam →
        </a>
      </div>
      <div className="card-footer">
        <span>{d.dealRating ? `Deal ${d.dealRating}` : ""}</span>
        <span>#{d.steamAppID}</span>
      </div>
    </article>
  );
}

export default memo(SteamDealCard);
