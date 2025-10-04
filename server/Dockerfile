# syntax=docker/dockerfile:1

FROM node:18-bookworm-slim AS base

WORKDIR /app

ENV NODE_ENV=production

# Install system dependencies required by Prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 4000

CMD ["node", "src/server.js"]
