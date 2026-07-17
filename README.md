# Loot Drops

Web feed of free games from two sources:

- **GamerPower** — time-limited giveaways (Steam keys, DLC, beta invites)
- **FreeToGame** — permanently free-to-play games

Live at [www.lootdrop.qd.je](https://www.lootdrop.qd.je).

## Features

- Toggle between the two data sources
- Filter by category, platform, or saved items
- Sort by newest, value, popularity, ending soon, or A–Z
- Save cards to `localStorage`; state persists across sessions
- Random pick button that scrolls to a card
- Client-side title search
- Load-more pagination (60 per page)
- Dark and light themes with an OS-preference default

## Stack

- Vite 8 + React 19
- GamerPower API and FreeToGame API (both unauthenticated, CORS-open)
- Cloudflare Pages hosting
- Cloudflare Web Analytics
- Custom subdomain via deSEC.io + DigitalPlat FreeDomain

## Run locally

```bash
git clone https://github.com/theloyaltrojan/lootdrop
cd lootdrop
npm install
npm run dev
```

Dev server runs on `http://localhost:5173`. Pushes to `main` trigger a Cloudflare Pages deploy.
