#!/bin/bash

# Type checking script for frontend

echo "🔍 Running TypeScript type checking..."

# Run TypeScript compiler in no-emit mode
npx tsc --noEmit --project tsconfig.app.json

if [ $? -eq 0 ]; then
  echo "✅ TypeScript type checking passed!"
else
  echo "❌ TypeScript type checking failed!"
  exit 1
fi

# Run strict type checking if --strict flag is passed
if [ "$1" = "--strict" ]; then
  echo "🔍 Running strict TypeScript type checking..."
  npx tsc --noEmit --project tsconfig.strict.json
  
  if [ $? -eq 0 ]; then
    echo "✅ Strict TypeScript type checking passed!"
  else
    echo "⚠️  Strict TypeScript type checking failed (non-blocking)"
  fi
fi