# CryptoPulse

Real-time cryptocurrency analytics dashboard built with React, TypeScript, and Vite. Live prices stream via Kraken WebSocket; market data and historical charts come from the CoinCap REST API.

![CryptoPulse Dashboard](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple)

## Features

- **Live price updates** — Real-time BTC, ETH, SOL, and more via [Kraken WebSocket v2](https://docs.kraken.com/api/docs/websocket-v2/ticker)
- **Interactive dashboard** — Asset cards with price, 24h change, volume, and market cap
- **Historical charts** — 24h / 7d / 30d line charts with tooltips ([CoinCap history API](https://pro.coincap.io/api-docs))
- **Search, filter & sort** — By name/symbol, market category (Layer 1, Layer 2, DeFi), price, cap, volume
- **Favorites** — Star assets and persist to `localStorage`
- **Dark / light theme** — Toggle with preference saved to `localStorage`
- **Responsive layout** — Mobile-friendly with collapsible sidebar
- **Loading skeletons & error states** — Graceful fallbacks with retry buttons
- **Animated price updates** — Flash highlight on price up/down

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Live data | Kraken WebSocket (`wss://ws.kraken.com/v2`) |
| REST data | CoinCap API (with Kraken REST fallback) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- npm 9+

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

By default, market data uses **Kraken REST** (CoinCap is disabled in `.env`). To enable CoinCap when your network supports it, set `VITE_USE_COINCAP=true` in `.env`.

### Build for production

```bash
npm run build
npm run preview
```

The production build outputs to `dist/`.

## Deploy

[https://crypto-pulse-gules.vercel.app/](https://crypto-pulse-gules.vercel.app/)

## Project Structure

```
src/
├── components/
│   ├── dashboard/     # AssetTile, PriceChart, Sparkline
│   ├── layout/        # Header, Sidebar, Layout
│   └── ui/            # SearchBar, FilterBar, Skeleton, ThemeToggle
├── constants/         # Tracked asset list & Kraken pairs
├── hooks/
│   ├── useWebSocketPrices.ts
│   ├── useFetchAssetData.ts
│   ├── useAssetHistory.ts
│   ├── useTheme.tsx
│   └── useFavorites.ts
├── services/          # CoinCap API client
├── types/             # TypeScript interfaces
└── utils/             # Formatting & in-memory cache
```

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useWebSocketPrices` | Kraken ticker stream with auto-reconnect |
| `useFetchAssetData` | CoinCap asset list with periodic refresh |
| `useAssetHistory` | Cached historical price data for charts |
| `useTheme` | Dark/light theme context + localStorage |
| `useFavorites` | Favorite asset IDs persisted to localStorage |

## API References

- [Kraken WebSocket v2](https://docs.kraken.com/api/docs/websocket-v2/ticker)
- [CoinCap Assets API](https://pro.coincap.io/api-docs)
- [Recharts Examples](https://recharts.org/en-US/examples)

