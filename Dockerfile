# docker/Dockerfile.api
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm --filter @aura/api build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main.js"]