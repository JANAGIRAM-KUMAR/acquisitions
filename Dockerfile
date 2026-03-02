# syntax=docker/dockerfile:1

# --- Base ---
FROM node:22-alpine AS base
WORKDIR /app
RUN mkdir -p logs

# --- Dependencies ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Build (includes devDependencies for migrations / tooling) ---
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# --- Production ---
FROM base AS production
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY drizzle.config.js ./
COPY drizzle ./drizzle
COPY src ./src

EXPOSE 3000
CMD ["node", "src/index.js"]
