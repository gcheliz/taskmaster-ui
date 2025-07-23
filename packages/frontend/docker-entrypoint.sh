#!/bin/sh
# Docker entrypoint for frontend development

# Find vite in pnpm store
VITE_PATH=$(find /app/node_modules/.pnpm -name "vite" -type d -path "*/node_modules/vite" | head -1)

if [ -z "$VITE_PATH" ]; then
    echo "Error: Could not find vite in pnpm store"
    exit 1
fi

echo "Found vite at: $VITE_PATH"

# Get the parent directory of vite (which contains node_modules)
VITE_NODE_MODULES=$(dirname "$VITE_PATH")

# Set NODE_PATH to include both the pnpm store location and workspace root
export NODE_PATH="$VITE_NODE_MODULES:/app/node_modules:$NODE_PATH"

# Also set NODE_OPTIONS for ESM module resolution
export NODE_OPTIONS="--preserve-symlinks --preserve-symlinks-main"

# Execute vite directly
exec node "$VITE_PATH/bin/vite.js" --host 0.0.0.0