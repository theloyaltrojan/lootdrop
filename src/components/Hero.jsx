export default function Hero({ source, count, worth }) {
  const countText = count == null ? "—" : count.toLocaleString();
  const worthText =
    worth == null ? "—" : "$" + Math.round(worth).toLocaleString();

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

