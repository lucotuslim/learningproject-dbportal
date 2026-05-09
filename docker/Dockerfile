# =========================
# Base
# =========================
FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Native build dependencies
RUN apt-get update && apt-get install -y \
        python3 \
        make \
        g++ \
        unixodbc \
        unixodbc-dev \
        && rm -rf /var/lib/apt/lists/*

# =========================
# Dependencies
# =========================
FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

# =========================
# Builder
# =========================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# =========================
# Runner
# =========================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# REQUIRED for msnodesqlv8 runtime
RUN apt-get update && apt-get install -y \
        unixodbc \
        unixodbc-dev \
        && rm -rf /var/lib/apt/lists/*

RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]