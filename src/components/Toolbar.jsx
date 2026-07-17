const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "game", label: "Games" },
  { value: "loot", label: "Loot" },
  { value: "beta", label: "Playtests" },
];

const SORT_OPTIONS = [
  { value: "date", label: "Newest" },
  { value: "value", label: "By value" },
  { value: "popularity", label: "Popular" },
  { value: "expiry", label: "Ending soon" },
];

export default function Toolbar({
  type,
  onType,
  platform,
  onPlatform,
  platforms,
  search,
  onSearch,
  sort,
  onSort,
  savedOnly,
  onSavedOnly,
  savedCount,
}) {
  return (
    <div className="toolbar">
      <div className="filter-row">
        <div className="chip-group">
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={"chip" + (type === o.value ? " active" : "")}
              onClick={() => onType(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="chip-group">
          <button
            type="button"
            className={"chip" + (platform === "all" ? " active" : "")}
            onClick={() => onPlatform("all")}
          >
            All platforms
          </button>
          {platforms.map((name) => (
            <button
              key={name}
              type="button"
              className={"chip" + (platform === name ? " active" : "")}
              onClick={() => onPlatform(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="chip-group">
          <button
            type="button"
            className={"chip" + (savedOnly ? " active" : "")}
            onClick={() => onSavedOnly(!savedOnly)}
            aria-pressed={savedOnly}
          >
            ★ Saved{savedCount > 0 ? ` (${savedCount})` : ""}
          </button>
        </div>
      </div>
      <div className="tool-right">
        <input
          type="text"
          className="search"
          placeholder="Search titles…"
          aria-label="Search giveaways"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          className="select"
          aria-label="Sort order"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
