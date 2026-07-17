import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Toolbar from "./components/Toolbar";
import GiveawayCard from "./components/GiveawayCard";
import Skeleton from "./components/Skeleton";
import { parseWorth, daysUntil } from "./utils";

const SAVED_KEY = "lootdrop-saved";

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export default function LootDrop() {
  const [giveaways, setGiveaways] = useState(null);
  const [worthStats, setWorthStats] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const [type, setType] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");

  const [saved, setSaved] = useState(loadSaved);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    } catch {
      /* ignore */
    }
  }, [saved]);

  const toggleSaved = (id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [gRes, wRes] = await Promise.all([
          fetch("https://www.gamerpower.com/api/giveaways"),
          fetch("https://www.gamerpower.com/api/worth"),
        ]);
        const g = await gRes.json();
        const w = await wRes.json();
        if (cancelled) return;
        setGiveaways(Array.isArray(g) ? g : []);
        setWorthStats(w);
        setLastUpdate(
          "Updated " +
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        );
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const platforms = useMemo(() => {
    if (!giveaways) return [];
    const counts = {};
    giveaways.forEach((g) => {
      (g.platforms || "")
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => {
          counts[p] = (counts[p] || 0) + 1;
        });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, [giveaways]);

  const filtered = useMemo(() => {
    if (!giveaways) return [];
    let items = giveaways;
    if (savedOnly) items = items.filter((g) => saved.has(g.id));
    if (type !== "all") {
      items = items.filter((g) =>
        (g.type || "").toLowerCase().includes(type),
      );
    }
    if (platform !== "all") {
      items = items.filter((g) => (g.platforms || "").includes(platform));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((g) => (g.title || "").toLowerCase().includes(q));
    }
    items = [...items];
    if (sort === "value") {
      items.sort((a, b) => parseWorth(b.worth) - parseWorth(a.worth));
    } else if (sort === "popularity") {
      items.sort((a, b) => (b.users || 0) - (a.users || 0));
    } else if (sort === "date") {
      items.sort(
        (a, b) => new Date(b.published_date) - new Date(a.published_date),
      );
    } else if (sort === "expiry") {
      items.sort(
        (a, b) =>
          (daysUntil(a.end_date) ?? 9999) - (daysUntil(b.end_date) ?? 9999),
      );
    }
    return items;
  }, [giveaways, type, platform, search, sort, saved, savedOnly]);

  const count = worthStats?.active_giveaways_number ?? giveaways?.length ?? null;
  const worth = worthStats?.worth_estimation_usd ?? null;

  const totalCount = giveaways?.length ?? 0;
  const showResultsCount =
    giveaways != null && !error && !(savedOnly && saved.size === 0);
  const resultsLabel =
    filtered.length === totalCount
      ? `${totalCount.toLocaleString()} drops`
      : `${filtered.length.toLocaleString()} of ${totalCount.toLocaleString()} drops`;

  return (
    <div className="page">
      <Header />
      <Hero count={count} worth={worth} />
      <Toolbar
        type={type}
        onType={setType}
        platform={platform}
        onPlatform={setPlatform}
        platforms={platforms}
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        savedOnly={savedOnly}
        onSavedOnly={setSavedOnly}
        savedCount={saved.size}
      />
      {showResultsCount && (
        <div className="results-count">{resultsLabel}</div>
      )}
      <div className="grid">
        {error ? (
          <div className="state">Failed to load — {error}</div>
        ) : giveaways == null ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="state">
            {savedOnly && saved.size === 0
              ? "No saved drops yet. Tap the star on any card to save it."
              : "No drops match your filters"}
          </div>
        ) : (
          filtered.map((g) => (
            <GiveawayCard
              key={g.id}
              giveaway={g}
              isSaved={saved.has(g.id)}
              onToggleSave={toggleSaved}
            />
          ))
        )}
      </div>
      <footer className="foot">
        <div>
          Data:{" "}
          <a
            href="https://www.gamerpower.com/api-read"
            target="_blank"
            rel="noopener noreferrer"
          >
            gamerpower.com/api
          </a>{" "}
          · not affiliated with any storefront
        </div>
        <div>{lastUpdate || "—"}</div>
      </footer>
    </div>
  );
}
