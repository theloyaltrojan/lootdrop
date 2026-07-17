export default function Hero({ count, worth }) {
  const countText = count == null ? "—" : count.toLocaleString();
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
