# ADTV — Canlı Haber Duvarı

Watch multiple Turkish news channels at once in a resizable, drag-and-drop six-panel grid.

## Features

- **6 live panels** — one primary feed and five side/bottom channels
- **Drag to swap** — reorder any panel by dragging
- **Resizable layout** — splitters between main, side stack, and bottom row
- **Settings** — hide title bars, edit YouTube URLs, fetch titles via oEmbed
- **Turkish / English** — TR default, EN optional (URL: `?lang=en`)
- **Shareable layout** — grid, streams, and language stored in the URL query string
- **Geo hint** — suggests English for visitors outside Turkey

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and set your production URL for SEO:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## URL parameters

| Param | Description |
|-------|-------------|
| `lang` | `tr` (default) or `en` |
| `titles` | `1` show title bars, `0` hide |
| `c` | Column sizes, e.g. `1,1,0.85` |
| `r` | Row sizes, e.g. `1,1,0.75` |
| `p` | Panel config: `id@slot~videoId~title` (pipe-separated) |

## Configure channels

Edit default streams in `app/config/streams.ts`.

## Stack

- [Next.js 16](https://nextjs.org/)
- React 19
- Tailwind CSS 4

## License

Private — All rights reserved.
