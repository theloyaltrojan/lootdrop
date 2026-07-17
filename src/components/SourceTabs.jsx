const TABS = [
  { value: "giveaways", label: "Live giveaways", note: "expiring soon" },
  { value: "freegames", label: "Free-to-play", note: "always free" },
];

export default function SourceTabs({ source, onSource }) {
  return (
    <div className="source-tabs" role="tablist" aria-label="Data source">
      {TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={source === t.value}
          className={"source-tab" + (source === t.value ? " active" : "")}
          onClick={() => onSource(t.value)}
        >
          <span className="source-tab-label">{t.label}</span>
          <span className="source-tab-note">{t.note}</span>
        </button>
      ))}
    </div>
  );
}
