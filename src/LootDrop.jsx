import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Toolbar from "./components/Toolbar";
import GiveawayCard from "./components/GiveawayCard";
import Skeleton from "./components/Skeleton";
import { parseWorth, daysUntil } from "./utils";

export default function LootDrop() {
  const [giveaways, setGiveaways] = useState(null);
  const [worthStats, setWorthStats] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const [type, setType] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");

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
  }, [giveaways, type, platform, search, sort]);

  const count = worthStats?.active_giveaways_number ?? giveaways?.length ?? null;
  const worth = worthStats?.worth_estimation_usd ?? null;

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
      />
      <div className="grid">
        {error ? (
          <div className="state">Failed to load — {error}</div>
        ) : giveaways == null ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="state">No drops match your filters</div>
        ) : (
          filtered.map((g) => <GiveawayCard key={g.id} giveaway={g} />)
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
          · not affiliated with any storefront ·{" "}
          <a
            href="https://ko-fi.com/hedgert"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support on Ko-fi ☕
          </a>
        </div>
        <div>{lastUpdate || "—"}</div>
      </footer>
    </div>
  );
}
