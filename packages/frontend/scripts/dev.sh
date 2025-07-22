#!/bin/sh
# Development server startup script for Docker
# This script finds and executes vite from the pnpm workspace

# Set the working directory
cd /app/packages/frontend

# Find vite directory in pnpm store
VITE_DIR=$(ls -d /app/node_modules/.pnpm/vite@7.0.5*/node_modules 2>/dev/null | head -1)

if [ -n "$VITE_DIR" ]; then
    echo "Found vite modules at: $VITE_DIR"
    
    # Set NODE_PATH to include the pnpm vite location
    export NODE_PATH="${VITE_DIR}:${NODE_PATH}"
    
    # Also set for ESM modules
    export NODE_OPTIONS="--preserve-symlinks --preserve-symlinks-main"
    
    # Run vite directly from its location
    VITE_BIN="${VITE_DIR}/vite/bin/vite.js"
    
    if [ -f "$VITE_BIN" ]; then
        echo "Running vite from: $VITE_BIN"
        exec node "$VITE_BIN" --host 0.0.0.0
    fi
fi

# Fallback
echo "Vite not found, trying pnpm run dev"
exec pnpm run dev --host 0.0.0.0