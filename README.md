# Loot Drops

A live web feed of every open video game giveaway, DLC drop, and beta invite currently available across Steam, Epic Games, GOG, PlayStation, Xbox, mobile, and DRM-free storefronts. Pulled directly from the [GamerPower API](https://www.gamerpower.com/api-read).

**Live:** [www.lootdrop.qd.je](https://www.lootdrop.qd.je)

![Loot Drops](./public/og.svg)

## What it does

- Fetches every currently-active giveaway from GamerPower's public API on load
- Client-side filtering by type (games / loot / playtests), platform, and title search
- Sorts by newest, value, popularity, or ending soon
- Encodes drop worth as a rarity tier (common → rare → legendary); legendary cards fill with the accent color so the highest-value drops leap out of the grid
- Deep-links straight to each provider's redemption page on click

## Stack

- **Vite 8** + **React 19** — static SPA, no backend
- **GamerPower API** — data source, unauthenticated, CORS-open
- **Cloudflare Pages** — hosting and SSL
- **deSEC.io** DNS + **DigitalPlat FreeDomain** — custom subdomain
- **Agentation** — dev-only in-page annotation tool for the design iteration loop

## Run locally

```bash
git clone https://github.com/theloyaltrojan/lootdrop
cd lootdrop
npm install
npm run dev
```

The dev server binds to `http://localhost:5173`. Agentation only mounts in dev — production builds omit it via `import.meta.env.DEV`.

## Design notes

Warm-dark ground (`#0f0e0d`) with a single coral accent (`#ff6a35`), geometric heavy-weight system sans throughout, rounded pill controls, hairline borders. The favicon, wordmark, hero periods, and legendary card fills all share the same accent so the brand reads as one system rather than a palette.
