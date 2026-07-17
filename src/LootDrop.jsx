import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SourceTabs from "./components/SourceTabs";
import Toolbar from "./components/Toolbar";
import GiveawayCard from "./components/GiveawayCard";
import FreeGameCard from "./components/FreeGameCard";
import Skeleton from "./components/Skeleton";
import { parseWorth, daysUntil } from "./utils";

const SAVED_KEY = "lootdrop-saved";

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    // Migrate pre-namespaced numeric IDs (old app only had giveaways)
    return new Set(
      parsed.map((v) =>
        typeof v === "string" && v.includes(":") ? v : `gp:${v}`,
      ),
    );
  } catch {
    return new Set();
  }
}

export default function LootDrop() {
  const [source, setSource] = useState("giveaways");

  const [giveaways, setGiveaways] = useState(null);
  const [worthStats, setWorthStats] = useState(null);
  const [freeGames, setFreeGames] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const [category, setCategory] = useState("all");
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

  const savedKey = (id) => `${source === "giveaways" ? "gp" : "ftg"}:${id}`;
  const toggleSaved = (id) => {
    const key = savedKey(id);
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    setCategory("all");
    setPlatform("all");
    setSort(source === "giveaways" ? "date" : "popularity");
    setSavedOnly(false);
    setError(null);
  }, [source]);

  useEffect(() => {
    let cancelled = false;
    async function loadGiveaways() {
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
        setLastUpdate(stamp());
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    async function loadFreeGames() {
      try {
        const res = await fetch(
          "https://www.freetogame.com/api/games?sort-by=popularity",
        );
        const list = await res.json();
        if (cancelled) return;
        setFreeGames(Array.isArray(list) ? list : []);
        setLastUpdate(stamp());
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    if (source === "giveaways" && giveaways == null) loadGiveaways();
    if (source === "freegames" && freeGames == null) loadFreeGames();
    return () => {
      cancelled = true;
    };
  }, [source, giveaways, freeGames]);

  const items = source === "giveaways" ? giveaways : freeGames;

  const categoryOptions = useMemo(() => {
    if (source === "giveaways") {
      return [
        { value: "all", label: "All" },
        { value: "game", label: "Games" },
        { value: "loot", label: "Loot" },
        { value: "beta", label: "Playtests" },
      ];
    }
    if (!freeGames) return [{ value: "all", label: "All" }];
    const counts = {};
    freeGames.forEach((g) => {
      const gen = (g.genre || "").trim();
      if (gen) counts[gen] = (counts[gen] || 0) + 1;
    });
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => ({ value: name, label: name }));
    return [{ value: "all", label: "All" }, ...top];
  }, [source, freeGames]);

  const platforms = useMemo(() => {
    if (!items) return [];
    const counts = {};
    const getPlatforms =
      source === "giveaways"
        ? (g) => (g.platforms || "").split(",").map((p) => p.trim())
        : (g) => [(g.platform || "").replace(/\s*\(.*?\)\s*/g, "").trim()];
    items.forEach((g) => {
      getPlatforms(g)
        .filter(Boolean)
        .forEach((p) => {
          counts[p] = (counts[p] || 0) + 1;
        });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, source === "giveaways" ? 8 : 4)
      .map(([name]) => name);
  }, [items, source]);

  const sortOptions = useMemo(() => {
    if (source === "giveaways") {
      return [
        { value: "date", label: "Newest" },
        { value: "value", label: "By value" },
        { value: "popularity", label: "Popular" },
        { value: "expiry", label: "Ending soon" },
      ];
    }
    return [
      { value: "popularity", label: "Popular" },
      { value: "date", label: "Newest" },
      { value: "alpha", label: "A–Z" },
    ];
  }, [source]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = items;

    if (savedOnly) {
      list = list.filter((g) => saved.has(savedKey(g.id)));
    }

    if (category !== "all") {
      if (source === "giveaways") {
        list = list.filter((g) =>
          (g.type || "").toLowerCase().includes(category),
        );
      } else {
        list = list.filter((g) => (g.genre || "") === category);
      }
    }

    if (platform !== "all") {
      if (source === "giveaways") {
        list = list.filter((g) => (g.platforms || "").includes(platform));
      } else {
        list = list.filter((g) => (g.platform || "").includes(platform));
      }
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) => (g.title || "").toLowerCase().includes(q));
    }

    list = [...list];
    if (source === "giveaways") {
      if (sort === "value") {
        list.sort((a, b) => parseWorth(b.worth) - parseWorth(a.worth));
      } else if (sort === "popularity") {
        list.sort((a, b) => (b.users || 0) - (a.users || 0));
      } else if (sort === "date") {
        list.sort(
          (a, b) => new Date(b.published_date) - new Date(a.published_date),
        );
      } else if (sort === "expiry") {
        list.sort(
          (a, b) =>
            (daysUntil(a.end_date) ?? 9999) - (daysUntil(b.end_date) ?? 9999),
        );
      }
    } else {
      if (sort === "popularity") {
        // API already returns sorted by popularity
      } else if (sort === "date") {
        list.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date),
        );
      } else if (sort === "alpha") {
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      }
    }
    return list;
    // savedKey is captured via source; source is a dep
  }, [items, category, platform, search, sort, saved, savedOnly, source]);

  const count =
    source === "giveaways"
      ? (worthStats?.active_giveaways_number ?? giveaways?.length ?? null)
      : (freeGames?.length ?? null);
  const worth = source === "giveaways" ? worthStats?.worth_estimation_usd : null;

  const savedCountForSource = useMemo(() => {
    const prefix = source === "giveaways" ? "gp:" : "ftg:";
    let n = 0;
    saved.forEach((k) => {
      if (k.startsWith(prefix)) n++;
    });
    return n;
  }, [saved, source]);

  const totalCount = items?.length ?? 0;
  const showResultsCount =
    items != null && !error && !(savedOnly && savedCountForSource === 0);
  const labelWord = source === "giveaways" ? "drops" : "games";
  const resultsLabel =
    filtered.length === totalCount
      ? `${totalCount.toLocaleString()} ${labelWord}`
      : `${filtered.length.toLocaleString()} of ${totalCount.toLocaleString()} ${labelWord}`;

  return (
    <div className="page">
      <Header />
      <SourceTabs source={source} onSource={setSource} />
      <Hero source={source} count={count} worth={worth} />
      <Toolbar
        categoryOptions={categoryOptions}
        category={category}
        onCategory={setCategory}
        platform={platform}
        onPlatform={setPlatform}
        platforms={platforms}
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        sortOptions={sortOptions}
        savedOnly={savedOnly}
        onSavedOnly={setSavedOnly}
        savedCount={savedCountForSource}
      />
      {showResultsCount && (
        <div className="results-count">{resultsLabel}</div>
      )}
      <div className="grid">
        {error ? (
          <div className="state">Failed to load — {error}</div>
        ) : items == null ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="state">
            {savedOnly && savedCountForSource === 0
              ? "Nothing saved here yet. Tap the star on any card to save it."
              : "No results match your filters"}
          </div>
        ) : source === "giveaways" ? (
          filtered.map((g) => (
            <GiveawayCard
              key={g.id}
              giveaway={g}
              isSaved={saved.has(savedKey(g.id))}
              onToggleSave={toggleSaved}
            />
          ))
        ) : (
          filtered.map((g) => (
            <FreeGameCard
              key={g.id}
              game={g}
              isSaved={saved.has(savedKey(g.id))}
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
            gamerpower.com
          </a>{" "}
          +{" "}
          <a
            href="https://www.freetogame.com/api-doc"
            target="_blank"
            rel="noopener noreferrer"
          >
            freetogame.com
          </a>{" "}
          · not affiliated with any storefront
        </div>
        <div>{lastUpdate || "—"}</div>
      </footer>
    </div>
  );
}

function stamp() {
  return (
    "Updated " +
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}
