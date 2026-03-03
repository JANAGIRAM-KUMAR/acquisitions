# Docker Setup

This document explains how to run the Acquisitions API using Docker in both **development** (Neon Local) and **production** (Neon Cloud) modes.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2+
- A [Neon](https://neon.tech) account with a project created
- A **Neon API key** — generate one from the Neon console under **Account Settings → API Keys**
- Your **Neon Project ID** — found under **Project Settings → General**

---

## Development (Neon Local)

Development uses [Neon Local](https://neon.com/docs/local/neon-local), a proxy that creates **ephemeral database branches** tied to your Docker environment lifecycle. Each `docker compose up` gets a fresh branch; it is deleted on `docker compose down`.

### 1. Configure environment

Copy the template and fill in your Neon credentials:

```bash
cp .env.development .env.development.local   # optional: keep a personal copy
```

Edit `.env.development` and set:

| Variable           | Description                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| `NEON_API_KEY`     | Your Neon API key                                                               |
| `NEON_PROJECT_ID`  | Your Neon project ID                                                            |
| `PARENT_BRANCH_ID` | _(optional)_ Branch to fork from. Leave empty to use the project default branch |
| `JWT_SECRET`       | Any string for local JWT signing                                                |
| `ARCJET_KEY`       | Your Arcjet key                                                                 |

> `DATABASE_URL` is set automatically in `docker-compose.dev.yml` to `postgres://neon:npg@neon-local:5432/neondb`. You do **not** need to set it in `.env.development` when running via Docker.

### 2. Start the stack

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development up --build
```

This starts:

1. **neon-local** — Neon Local proxy on port 5432 (creates an ephemeral branch)
2. **app** — the API on port 3000, connected to neon-local

### 3. Run database migrations

With the stack running, exec into the app container:

```bash
docker compose -f docker-compose.dev.yml exec app npx drizzle-kit migrate
```

### 4. Stop the stack

```bash
docker compose -f docker-compose.dev.yml down
```

The ephemeral branch is automatically deleted when the neon-local container stops.

### Connecting from the host (outside Docker)

If you want to run the app outside Docker but still use the Neon Local proxy:

```bash
# Start only neon-local
docker compose -f docker-compose.dev.yml --env-file .env.development up neon-local

# In another terminal, run the app with Neon Local config
NEON_LOCAL=true DATABASE_URL=postgres://neon:npg@localhost:5432/neondb npm run dev
```

---

## Production (Neon Cloud)

Production connects directly to your Neon Cloud database. No Neon Local proxy is involved.

### 1. Configure environment

Edit `.env.production` and set:

| Variable       | Description                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Your full Neon Cloud connection string (e.g. `postgres://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`) |
| `JWT_SECRET`   | A strong, unique secret for production                                                                                     |
| `ARCJET_KEY`   | Your Arcjet key                                                                                                            |

### 2. Start the app

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Run database migrations

```bash
docker compose -f docker-compose.prod.yml exec app npx drizzle-kit migrate
```

### 4. Stop the app

```bash
docker compose -f docker-compose.prod.yml down
```

---

## How DATABASE_URL Switching Works

The environment controls which database the app talks to:

```
┌─────────────┐     docker-compose.dev.yml      ┌─────────────┐
│     App      │ ──DATABASE_URL──────────────▶   │  Neon Local  │ ──▶ Ephemeral Branch
│  (container) │     neon-local:5432             │  (container) │
└─────────────┘                                  └─────────────┘

┌─────────────┐     docker-compose.prod.yml
│     App      │ ──DATABASE_URL──────────────▶   Neon Cloud (remote)
│  (container) │     ep-xxx.neon.tech
└─────────────┘
```

- **Development**: `docker-compose.dev.yml` sets `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb` and `NEON_LOCAL=true`. The app's `database.js` detects `NEON_LOCAL` and configures the Neon serverless driver for HTTP-mode communication with the local proxy.
- **Production**: `.env.production` supplies the real Neon Cloud URL. `NEON_LOCAL` is not set, so the serverless driver uses its default (secure) configuration.

---

## Building the Image Only

```bash
docker build -t acquisitions-api .
```

## Environment Variables Reference

| Variable           | Dev            | Prod           | Description                                |
| ------------------ | -------------- | -------------- | ------------------------------------------ |
| `PORT`             | 3000           | 3000           | Server listen port                         |
| `NODE_ENV`         | development    | production     | Environment mode                           |
| `DATABASE_URL`     | Set by compose | Neon Cloud URL | Postgres connection string                 |
| `NEON_LOCAL`       | `true`         | _(unset)_      | Enables Neon Local driver config           |
| `NEON_LOCAL_HOST`  | `neon-local`   | _(unset)_      | Hostname of the Neon Local container       |
| `NEON_API_KEY`     | Required       | —              | Neon API key (for neon-local container)    |
| `NEON_PROJECT_ID`  | Required       | —              | Neon project ID (for neon-local container) |
| `PARENT_BRANCH_ID` | Optional       | —              | Parent branch for ephemeral fork           |
| `JWT_SECRET`       | Any string     | Strong secret  | JWT signing key                            |
| `ARCJET_KEY`       | Your key       | Your key       | Arcjet API key                             |
