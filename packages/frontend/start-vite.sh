#!/bin/sh
# Start vite directly without pnpm

cd /app/packages/frontend

# Find vite directory in pnpm store
VITE_DIR=$(find /app/node_modules/.pnpm -name "vite" -type d -path "*/node_modules/vite" | head -1)

if [ -z "$VITE_DIR" ]; then
    echo "Error: Could not find vite directory"
    exit 1
fi

echo "Found vite at: $VITE_DIR"

# Get the parent directory that contains node_modules
PNPM_MODULES=$(dirname "$VITE_DIR")

# Set up comprehensive module resolution
export NODE_PATH="$PNPM_MODULES:$VITE_DIR:$VITE_DIR/dist/node:/app/node_modules"

# Create a package.json in temp directory to help with module resolution
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
echo '{"type":"module"}' > package.json

# Create symlinks to help with module resolution
ln -s "$VITE_DIR" node_modules
mkdir -p node_modules/@vitejs
ln -s /app/node_modules/.pnpm/@vitejs*/node_modules/@vitejs/plugin-react node_modules/@vitejs/plugin-react 2>/dev/null || true

# Copy vite config
cp /app/packages/frontend/vite.config.ts .
cp -r /app/packages/frontend/src .
cp /app/packages/frontend/index.html .
cp -r /app/packages/frontend/public .
cp /app/packages/frontend/tsconfig*.json .
cp /app/packages/frontend/*.config.js .

# Run vite from the temp directory
exec node "$VITE_DIR/bin/vite.js" --config /app/packages/frontend/vite.config.ts --root /app/packages/frontend --host 0.0.0.0