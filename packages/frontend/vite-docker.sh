#!/bin/sh
# Vite Docker startup script for pnpm workspaces

cd /app

# Use pnpm from the workspace root to run vite in the frontend package
exec pnpm --filter frontend dev --host 0.0.0.0