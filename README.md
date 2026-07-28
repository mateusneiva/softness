# Softness

Storefront and admin dashboard for **Softness**, a full-stack e-commerce experience built with Next.js and a dedicated Fastify API.

Portfolio project showcasing product discovery, authenticated checkout, account management, and a practical admin panel.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **State / forms:** Zustand, React Hook Form, Zod
- **HTTP:** Axios
- **Language:** TypeScript

## Features

- Product catalog, collections, search, and reviews
- Cart and checkout with flat-rate / free shipping
- Account area: profile, addresses, orders, Stripe payment methods
- Auth flows: register/login, optional email verification, Google OAuth (API-driven)
- Admin (`/admin`): products, collections, banners, coupons, orders, store settings
- Bot protection via Cloudflare Turnstile when the API provides keys

## Requirements

- pnpm 10+
- Node.js 20+
- Running [Softness API](../softness-api) (default `http://localhost:5555`)

## Quick start

### 1. Start the API

Follow the setup in [`softness-api/README.md`](../softness-api/README.md) (`db:setup`, then `pnpm dev`).

### 2. Start the storefront

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

App: [http://localhost:3000](http://localhost:3000)

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Public API URL used by the browser (baked in at **build** time) |

Local default (`.env.example`): `http://localhost:5555`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## Demo accounts

After seeding the API:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@softness.com` | `admin123456` |
| Customer | `customer@softness.com` | `admin123456` |

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Docker

Copy env defaults, then start (API must be reachable at `NEXT_PUBLIC_API_URL`):

```bash
cp .env.example .env
docker compose up --build
```

- Storefront → [http://localhost:3000](http://localhost:3000) (or whatever `PORT` is in `.env`)
- `NEXT_PUBLIC_API_URL` is a **build arg** — change it in `.env` before `docker compose build`
- `PORT` controls both the container listen port and the published host port

## Deploy

1. Deploy the **API** first (see `softness-api`).
2. Set `NEXT_PUBLIC_API_URL` to the public HTTPS API URL **before** building (Docker build arg or env).
3. Deploy this app (Docker, Vercel, or Node with `pnpm build && pnpm start`).
4. Point the API `FRONTEND_URL` at this site’s HTTPS origin.

Example:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Project layout

```
src/
  app/           # store, account, admin, auth, checkout routes
  components/    # UI and feature components
  services/      # API client
  store/         # client state
  types/
  utils/
```

## Related

Backend: [`softness-api`](../softness-api).
