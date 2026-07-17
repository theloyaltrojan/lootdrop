import { useEffect, useMemo, useState, startTransition } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SourceTabs from "./components/SourceTabs";
import Toolbar from "./components/Toolbar";
import GiveawayCard from "./components/GiveawayCard";
import FreeGameCard from "./components/FreeGameCard";
import SteamDealCard from "./components/SteamDealCard";
import Skeleton from "./components/Skeleton";
import { parseWorth, daysUntil } from "./utils";

const SAVED_KEY = "lootdrop-saved";

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.map((v) =>
        typeof v === "string" && v.includes(":") ? v : `gp:${v}`,
      ),
    );
  } catch {
    return new Set();
  }
}

const SOURCE_PREFIX = {
  giveaways: "gp",
  freegames: "ftg",
  sales: "sd",
};

export default function LootDrop() {
  const [source, setSource] = useState("giveaways");

  const [giveaways, setGiveaways] = useState(null);
  const [worthStats, setWorthStats] = useState(null);
  const [freeGames, setFreeGames] = useState(null);
  const [steamDeals, setSteamDeals] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");

  const [saved, setSaved] = useState(loadSaved);
  const [savedOnly, setSavedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60);
  const [spotlight, setSpotlight] = useState(null);

  const handleSourceChange = (next) => {
    startTransition(() => setSource(next));
  };

  const savedKey = (id) => `${SOURCE_PREFIX[source]}:${id}`;

  const handleRandom = () => {
    if (!filtered.length) return;
    const idx = Math.floor(Math.random() * filtered.length);
    const pick = filtered[idx];
    if (idx >= visibleCount) {
      setVisibleCount(Math.ceil((idx + 1) / 60) * 60);
    }
    const pickId = source === "sales" ? pick.dealID : pick.id;
    setSpotlight({ id: savedKey(pickId), key: Date.now() });
  };

  useEffect(() => {
    if (!spotlight) return;
    const el = document.getElementById(`card-${spotlight.id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("spotlight");
    return () => {
      el.classList.remove("spotlight");
    };
  }, [spotlight]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    } catch {
      /* ignore */
    }
  }, [saved]);

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
    if (source === "giveaways") setSort("date");
    else if (source === "freegames") setSort("popularity");
    else setSort("savings");
    setSavedOnly(false);
    setError(null);
    setVisibleCount(60);
    setSpotlight(null);
  }, [source]);

  useEffect(() => {
    setVisibleCount(60);
    setSpotlight(null);
  }, [category, platform, search, sort, savedOnly]);

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
    async function loadSales() {
      try {
        const res = await fetch(
          "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&sortBy=Savings",
        );
        const list = await res.json();
        if (cancelled) return;
        setSteamDeals(Array.isArray(list) ? list : []);
        setLastUpdate(stamp());
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    if (source === "giveaways" && giveaways == null) loadGiveaways();
    if (source === "freegames" && freeGames == null) loadFreeGames();
    if (source === "sales" && steamDeals == null) loadSales();
    return () => {
      cancelled = true;
    };
  }, [source, giveaways, freeGames, steamDeals]);

  const items =
    source === "giveaways"
      ? giveaways
      : source === "freegames"
        ? freeGames
        : steamDeals;

  const categoryOptions = useMemo(() => {
    if (source === "giveaways") {
      return [
        { value: "all", label: "All" },
        { value: "game", label: "Games" },
        { value: "loot", label: "Loot" },
        { value: "beta", label: "Playtests" },
      ];
    }
    if (source === "sales") {
      return [
        { value: "all", label: "All" },
        { value: "25", label: "25%+ off" },
        { value: "50", label: "50%+ off" },
        { value: "75", label: "75%+ off" },
        { value: "90", label: "90%+ off" },
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
      .slice(0, 15)
      .map(([name]) => ({ value: name, label: name }));
    return [{ value: "all", label: "All" }, ...top];
  }, [source, freeGames]);

  const platforms = useMemo(() => {
    if (!items || source === "sales") return [];
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
      .slice(0, source === "giveaways" ? 15 : 8)
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
    if (source === "sales") {
      return [
        { value: "savings", label: "Biggest saving" },
        { value: "price", label: "Cheapest" },
        { value: "rating", label: "Highest rated" },
        { value: "deal", label: "Best deal score" },
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
      const idFor = (g) => (source === "sales" ? g.dealID : g.id);
      list = list.filter((g) => saved.has(savedKey(idFor(g))));
    }

    if (category !== "all") {
      if (source === "giveaways") {
        list = list.filter((g) =>
          (g.type || "").toLowerCase().includes(category),
        );
      } else if (source === "sales") {
        const threshold = parseInt(category, 10);
        list = list.filter(
          (g) => (parseFloat(g.savings) || 0) >= threshold,
        );
      } else {
        list = list.filter((g) => (g.genre || "") === category);
      }
    }

    if (platform !== "all" && source !== "sales") {
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
    } else if (source === "sales") {
      if (sort === "savings") {
        list.sort(
          (a, b) => parseFloat(b.savings) - parseFloat(a.savings),
        );
      } else if (sort === "price") {
        list.sort(
          (a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice),
        );
      } else if (sort === "rating") {
        list.sort(
          (a, b) =>
            (parseInt(b.steamRatingPercent, 10) || 0) -
            (parseInt(a.steamRatingPercent, 10) || 0),
        );
      } else if (sort === "deal") {
        list.sort(
          (a, b) =>
            (parseFloat(b.dealRating) || 0) - (parseFloat(a.dealRating) || 0),
        );
      }
    } else {
      if (sort === "date") {
        list.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date),
        );
      } else if (sort === "alpha") {
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      }
    }
    return list;
  }, [items, category, platform, search, sort, saved, savedOnly, source]);

  const count =
    source === "giveaways"
      ? (worthStats?.active_giveaways_number ?? giveaways?.length ?? null)
      : source === "freegames"
        ? (freeGames?.length ?? null)
        : (steamDeals?.length ?? null);
  const worth = source === "giveaways" ? worthStats?.worth_estimation_usd : null;
  const avgSavings = useMemo(() => {
    if (source !== "sales" || !steamDeals?.length) return null;
    const total = steamDeals.reduce(
      (acc, d) => acc + (parseFloat(d.savings) || 0),
      0,
    );
    return total / steamDeals.length;
  }, [source, steamDeals]);

  const savedCountForSource = useMemo(() => {
    const prefix = SOURCE_PREFIX[source] + ":";
    let n = 0;
    saved.forEach((k) => {
      if (k.startsWith(prefix)) n++;
    });
    return n;
  }, [saved, source]);

  const totalCount = items?.length ?? 0;
  const showResultsCount =
    items != null && !error && !(savedOnly && savedCountForSource === 0);
  const labelWord =
    source === "giveaways"
      ? "drops"
      : source === "freegames"
        ? "games"
        : "deals";
  const resultsLabel =
    filtered.length === totalCount
      ? `${totalCount.toLocaleString()} ${labelWord}`
      : `${filtered.length.toLocaleString()} of ${totalCount.toLocaleString()} ${labelWord}`;

  return (
    <div className="page">
      <Header />
      <SourceTabs source={source} onSource={handleSourceChange} />
      <Hero source={source} count={count} worth={worth} avgSavings={avgSavings} />
      <Toolbar
        categoryOptions={categoryOptions}
        category={category}
        onCategory={setCategory}
        platform={platform}
        onPlatform={setPlatform}
        platforms={platforms}
        hidePlatform={source === "sales"}
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        sortOptions={sortOptions}
        savedOnly={savedOnly}
        onSavedOnly={setSavedOnly}
        savedCount={savedCountForSource}
        onRandom={handleRandom}
        randomDisabled={!filtered.length}
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
          filtered.slice(0, visibleCount).map((g) => (
            <GiveawayCard
              key={g.id}
              giveaway={g}
              isSaved={saved.has(savedKey(g.id))}
              onToggleSave={toggleSaved}
            />
          ))
        ) : source === "freegames" ? (
          filtered.slice(0, visibleCount).map((g) => (
            <FreeGameCard
              key={g.id}
              game={g}
              isSaved={saved.has(savedKey(g.id))}
              onToggleSave={toggleSaved}
            />
          ))
        ) : (
          filtered.slice(0, visibleCount).map((d) => (
            <SteamDealCard
              key={d.dealID}
              deal={d}
              isSaved={saved.has(savedKey(d.dealID))}
              onToggleSave={toggleSaved}
            />
          ))
        )}
        {filtered.length > visibleCount && (
          <button
            className="load-more"
            type="button"
            onClick={() =>
              setVisibleCount((v) =>
                Math.min(v + 60, filtered.length),
              )
            }
          >
            Load {Math.min(60, filtered.length - visibleCount)} more
          </button>
        )}
      </div>
      <section className="about" aria-labelledby="about-heading">
        <h2 id="about-heading">About Loot Drops</h2>
        <p>
          Loot Drops aggregates every currently-active free game giveaway,
          key drop, and beta invite from across the web, alongside a full
          catalog of permanently free-to-play games and live Steam discounts.
          New listings are pulled from the GamerPower, FreeToGame, and
          CheapShark APIs on every page load, so the grid always reflects
          what's actually available right now.
        </p>
        <p>
          Giveaways typically come from Steam, Epic Games Store, GOG,
          PlayStation Store, Xbox, itch.io, and mobile storefronts, plus
          services like Alienware Arena, Prime Gaming, Fanatical, and
          Humble Bundle. Click <strong>Claim now</strong> on any card to
          open the provider's redemption page — you'll finish the claim on
          their own site, so the terms are whatever they set (Steam key,
          Epic library grant, in-game currency, closed beta invite).
        </p>
        <p>
          The site is free, has no accounts, and isn't affiliated with any
          storefront. Filter by category, platform, or saved items; sort by
          newest, value, popularity, or ending soon; bookmark cards to your
          browser for later, or hit <strong>Random</strong> to surface
          something you'd otherwise scroll past.
        </p>
      </section>
      <footer className="foot">
        <div>
          Data:{" "}
          <a
            href="https://www.gamerpower.com/api-read"
            target="_blank"
            rel="noopener noreferrer"
          >
            gamerpower.com
          </a>
          {" + "}
          <a
            href="https://www.freetogame.com/api-doc"
            target="_blank"
            rel="noopener noreferrer"
          >
            freetogame.com
          </a>
          {" + "}
          <a
            href="https://apidocs.cheapshark.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            cheapshark.com
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
