export default function FreeGameCard({ game, isSaved, onToggleSave }) {
  const g = game;
  const platform = (g.platform || "").replace(/\s*\(.*?\)\s*/g, "").trim();
  const year = g.release_date ? new Date(g.release_date).getFullYear() : null;

  return (
    <article className="card tier-common">
      <div className="thumb">
        <img
          src={g.thumbnail}
          alt={g.title}
          loading="lazy"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <span className="type-tag">{platform}</span>
        <button
          type="button"
          className={"save-btn" + (isSaved ? " saved" : "")}
          onClick={() => onToggleSave(g.id)}
          aria-label={isSaved ? "Remove from saved" : "Save for later"}
          aria-pressed={isSaved}
          title={isSaved ? "Saved" : "Save for later"}
        >
          {isSaved ? "★" : "☆"}
        </button>
      </div>
      <div className="card-body">
        <h3 className="card-title">{g.title}</h3>
        <div className="platforms">
          {g.genre && <span className="platform genre">{g.genre}</span>}
          {g.publisher && (
            <span className="platform">{g.publisher}</span>
          )}
        </div>
        <p className="card-desc">{g.short_description}</p>
        <a
          className="claim"
          href={g.game_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Play now →
        </a>
      </div>
      <div className="card-footer">
        <span>{year ? `Released ${year}` : ""}</span>
        <span>#{g.id}</span>
      </div>
    </article>
  );
}
