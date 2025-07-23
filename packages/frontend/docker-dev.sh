#!/bin/sh
# Development server script for Docker with proper pnpm workspace handling

cd /app/packages/frontend

# Use the Docker-specific dev script
exec pnpm run dev:docker --host 0.0.0.0