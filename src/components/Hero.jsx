export default function Hero({ source, count, worth, avgSavings }) {
  const countText = count == null ? "—" : count.toLocaleString();

  if (source === "freegames") {
    return (
      <section className="hero">
        <h1 className="hero-title">
          Play free<span className="accent">.</span>
          <br />
          forever<span className="accent">.</span>
        </h1>
        <div className="hero-stats">
          <span>
            <strong className="hero-num accent">{countText}</strong>{" "}
            free-to-play games
          </span>
          <span className="hero-sep">·</span>
          <span>no expiration</span>
        </div>
        <p className="hero-desc">
          Permanently free games — MMOs, shooters, MOBAs, and browser titles
          you can jump into today. Hit <strong>Play now</strong> to open the
          client or launcher. No key redemption, no expiring codes.
        </p>
      </section>
    );
  }

  if (source === "sales") {
    const savingsText =
      avgSavings == null ? "—" : Math.round(avgSavings) + "%";
    return (
      <section className="hero">
        <h1 className="hero-title">
          Steam sales<span className="accent">.</span>
          <br />
          right now<span className="accent">.</span>
        </h1>
        <div className="hero-stats">
          <span>
            <strong className="hero-num">{countText}</strong> active deals
          </span>
          <span className="hero-sep">·</span>
          <span>
            <strong className="hero-num accent">{savingsText}</strong> average
            off
          </span>
        </div>
        <p className="hero-desc">
          Every game currently discounted on Steam, sorted by the biggest cut.
          Hit <strong>Get on Steam</strong> to jump to the store page and pick
          it up before the price resets. Data via the CheapShark API.
        </p>
      </section>
    );
  }

  const worthText =
    worth == null ? "—" : "$" + Math.round(worth).toLocaleString();
  return (
    <section className="hero">
      <h1 className="hero-title">
        Free games<span className="accent">.</span>
        <br />
        right now<span className="accent">.</span>
      </h1>
      <div className="hero-stats">
        <span>
          <strong className="hero-num">{countText}</strong> active drops
        </span>
        <span className="hero-sep">·</span>
        <span>
          <strong className="hero-num accent">{worthText}</strong> in freebies
        </span>
      </div>
      <p className="hero-desc">
        Every open giveaway, in one grid. Filter to what you want, hit{" "}
        <strong>Claim now</strong> on any card, and finish the redemption on
        the provider's page (Steam, Epic, Alienware, Prime Gaming, etc.) —
        they'll walk you through the last few steps.
      </p>
    </section>
  );
}
