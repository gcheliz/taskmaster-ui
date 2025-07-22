# TaskMaster UI - Multi-stage Production Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

#######################
# Frontend Build Stage
#######################
FROM base AS frontend-builder

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY packages/frontend ./packages/frontend
COPY packages/backend/prisma ./packages/backend/prisma

# Build frontend
RUN pnpm --filter=frontend run build

#######################
# Backend Build Stage
#######################
FROM base AS backend-builder

# Install dependencies including dev dependencies for build
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY packages/backend ./packages/backend

# Generate Prisma client and build backend
RUN pnpm --filter=backend run db:generate
RUN pnpm --filter=backend run build

#######################
# Frontend Production
#######################
FROM nginx:alpine AS frontend-production

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built frontend files
COPY --from=frontend-builder /app/packages/frontend/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

#######################
# Backend Production
#######################
FROM node:20-alpine AS backend-production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built backend and necessary files
COPY --from=backend-builder --chown=backend:nodejs /app/packages/backend/dist ./packages/backend/dist
COPY --from=backend-builder --chown=backend:nodejs /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=backend-builder --chown=backend:nodejs /app/node_modules/.pnpm/@prisma/client* ./node_modules/.pnpm/

# Copy migration script
COPY --chown=backend:nodejs scripts/migrate-and-start.sh ./
RUN chmod +x migrate-and-start.sh

# Switch to app user
USER backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["./migrate-and-start.sh"]

#######################
# Development Stage (for docker-compose)
#######################
FROM base AS development

# Install all dependencies including dev
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose ports
EXPOSE 3001 8080 6006

# Default command for development
CMD ["pnpm", "run", "dev"]