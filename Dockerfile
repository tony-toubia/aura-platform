# Multi-stage build for Next.js web application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_OPENWEATHER_API_KEY
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_MICROSOFT_CLIENT_ID
ARG NEXT_PUBLIC_STRAVA_CLIENT_ID
ARG OPENAI_API_KEY
ARG JWT_SECRET
ARG SUPABASE_SERVICE_ROLE_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_OPENWEATHER_API_KEY=$NEXT_PUBLIC_OPENWEATHER_API_KEY
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_MICROSOFT_CLIENT_ID=$NEXT_PUBLIC_MICROSOFT_CLIENT_ID
ENV NEXT_PUBLIC_STRAVA_CLIENT_ID=$NEXT_PUBLIC_STRAVA_CLIENT_ID
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV JWT_SECRET=$JWT_SECRET
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Copy everything including node_modules
COPY --from=deps /app ./

# Copy source code
COPY . .

# Build the web application
RUN cd apps/web && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# The standalone build puts server.js in apps/web/ subdirectory
CMD ["node", "apps/web/server.js"]