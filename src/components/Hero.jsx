export default function Hero({ count, worth }) {
  const countText = count == null ? "—" : count.toLocaleString();
  const worthText =
    worth == null ? "—" : "$" + Math.round(worth).toLocaleString();

  return (
    <section className="hero">
      <div>
        <h1 className="hero-title">
          Free games,
          <br />
          <span className="accent">right now.</span>
        </h1>
        <p className="hero-desc">
          Every open giveaway, in one grid. Filter to what you want, hit{" "}
          <strong>Claim now</strong> on any card, and finish the redemption on
          the provider's page (Steam, Epic, Alienware, Prime Gaming, etc.) —
          they'll walk you through the last few steps.
        </p>
      </div>
      <div className="stats">
        <div className="stat">
          <div className="stat-num">{countText}</div>
          <div className="stat-label">Active drops</div>
        </div>
        <div className="stat">
          <div className="stat-num">{worthText}</div>
          <div className="stat-label">Total value</div>
        </div>
      </div>
    </section>
  );
}
