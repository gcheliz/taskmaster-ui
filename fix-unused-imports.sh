#!/bin/bash

# Script to help identify and fix unused imports
echo "Finding files with unused imports..."

# Backend
echo "Backend files with unused imports:"
pnpm run lint:backend 2>&1 | grep "@typescript-eslint/no-unused-vars" | grep -o "packages/backend/[^:]*" | sort | uniq -c | sort -nr | head -20

echo ""
echo "Frontend files with unused imports:"
# Frontend
pnpm run lint:frontend 2>&1 | grep "@typescript-eslint/no-unused-vars" | grep -o "packages/frontend/[^:]*" | sort | uniq -c | sort -nr | head -20