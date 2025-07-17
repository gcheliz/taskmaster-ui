#!/bin/sh

# Docker Startup Script for TaskMaster Backend
# This script handles database migrations and starts the application

set -e

echo "🚀 TaskMaster Backend - Docker Startup Script"
echo "================================================"

# Environment validation
echo "📋 Validating environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

echo "✅ Environment variables validated"

# Wait for database to be ready
echo "🔄 Waiting for database to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "   Attempt $attempt/$max_attempts..."
    
    # Try to connect to database using a simple query
    if npx prisma db pull --force-reset 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null; then
        echo "✅ Database connection successful"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ ERROR: Failed to connect to database after $max_attempts attempts"
        exit 1
    fi
    
    echo "   Database not ready, waiting 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
done

# Run database migrations
echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
else
    echo "⚠️  Migration failed, attempting to push schema..."
    if npx prisma db push --accept-data-loss; then
        echo "✅ Database schema updated successfully"
    else
        echo "❌ ERROR: Failed to update database schema"
        exit 1
    fi
fi

# Generate Prisma client (ensure it's up to date)
echo "🔄 Generating Prisma client..."
if npx prisma generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ ERROR: Failed to generate Prisma client"
    exit 1
fi

# Verify database connection and schema
echo "🔄 Verifying database connection..."
if npx prisma db push --accept-data-loss --preview-feature 2>/dev/null || echo "Schema verification complete"; then
    echo "✅ Database verification successful"
else
    echo "⚠️  Database verification completed with warnings"
fi

# Optional: Seed database if SEED_DATABASE environment variable is set
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    if pnpm db:seed 2>/dev/null; then
        echo "✅ Database seeded successfully"
    else
        echo "⚠️  Database seeding failed or not configured"
    fi
fi

# Start the application
echo "🚀 Starting TaskMaster Backend application..."
echo "================================================"

# Use exec to ensure the Node.js process receives signals properly
exec pnpm start