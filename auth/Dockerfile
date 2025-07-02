FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nonroot

EXPOSE 3000

CMD ["dist/app.js"]