import { useEffect, useRef, useState } from "react";

const FilterIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="7" y1="12" x2="20" y2="12" />
    <line x1="11" y1="18" x2="20" y2="18" />
  </svg>
);

const ShuffleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

export default function Toolbar({
  categoryOptions,
  category,
  onCategory,
  platform,
  onPlatform,
  platforms,
  search,
  onSearch,
  sort,
  onSort,
  sortOptions,
  savedOnly,
  onSavedOnly,
  savedCount,
  onRandom,
  randomDisabled,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open]);

  const activeCount =
    (category !== "all" ? 1 : 0) +
    (platform !== "all" ? 1 : 0) +
    (savedOnly ? 1 : 0);

  const clearAll = () => {
    onCategory("all");
    onPlatform("all");
    onSavedOnly(false);
  };

  return (
    <div className="toolbar">
      <div className="filter-row">
        <div className="filter-wrap" ref={wrapRef}>
          <button
            type="button"
            className={"filter-btn" + (activeCount > 0 ? " has-active" : "")}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            <FilterIcon />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="filter-badge">{activeCount}</span>
            )}
          </button>

          {open && (
            <div className="filter-panel" role="dialog" aria-label="Filters">
              <div className="filter-panel-head">
                <span className="filter-panel-title">Filters</span>
                {activeCount > 0 && (
                  <button
                    type="button"
                    className="filter-clear"
                    onClick={clearAll}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="filter-section">
                <div className="filter-label">Category</div>
                <div className="filter-chips">
                  {categoryOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={
                        "chip standalone" +
                        (category === o.value ? " active" : "")
                      }
                      onClick={() => onCategory(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-label">Platform</div>
                <div className="filter-chips">
                  <button
                    type="button"
                    className={
                      "chip standalone" +
                      (platform === "all" ? " active" : "")
                    }
                    onClick={() => onPlatform("all")}
                  >
                    All
                  </button>
                  {platforms.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={
                        "chip standalone" +
                        (platform === name ? " active" : "")
                      }
                      onClick={() => onPlatform(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={savedOnly}
                    onChange={(e) => onSavedOnly(e.target.checked)}
                  />
                  <span>
                    ★ Show only saved
                    {savedCount > 0 && (
                      <span className="filter-toggle-hint">
                        {" "}
                        ({savedCount} saved)
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          className="random-btn"
          onClick={onRandom}
          disabled={randomDisabled}
          title="Jump to a random pick"
        >
          <ShuffleIcon />
          <span>Random</span>
        </button>
      </div>
      <div className="tool-right">
        <input
          type="text"
          className="search"
          placeholder="Search titles…"
          aria-label="Search titles"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          className="select"
          aria-label="Sort order"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

