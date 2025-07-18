# Backend Dockerfile for TaskMaster UI
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json and prisma schema
COPY packages/backend/package.json ./packages/backend/
COPY packages/backend/prisma ./packages/backend/prisma/

# Install dependencies
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN pnpm install --frozen-lockfile

# Copy remaining backend source code
COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/
COPY packages/backend/nodemon.json ./packages/backend/

# Build stage
FROM base AS build
WORKDIR /app/packages/backend

# Generate Prisma client
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install pnpm and curl for health checks
RUN npm install -g pnpm && \
    apk add --no-cache curl

WORKDIR /app

# Copy built application
COPY --from=build /app/packages/backend/dist ./dist
COPY --from=build /app/packages/backend/package.json ./
COPY --from=build /app/packages/backend/prisma ./prisma
COPY --from=build /app/packages/backend/node_modules ./node_modules

# Copy migration startup script
COPY packages/backend/scripts/docker-start.sh ./scripts/
RUN chmod +x ./scripts/docker-start.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application with migration script
CMD ["./scripts/docker-start.sh"]

# Development stage
FROM base AS development
WORKDIR /app/packages/backend

# Install additional dev dependencies
RUN apk add --no-cache curl

# Expose port and Prisma Studio port
EXPOSE 3001 5555

# Start development server
CMD ["pnpm", "dev"]