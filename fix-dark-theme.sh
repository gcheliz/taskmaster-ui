#!/bin/bash

# This script fixes dark theme issues in the TaskMaster UI project
# It removes dark: classes and fixes text colors for light theme only

echo "🎨 Fixing dark theme issues in TaskMaster UI..."

# Create backup directory
mkdir -p .backup-dark-theme

# Function to fix a file
fix_file() {
    local file=$1
    local backup_file=".backup-dark-theme/$(basename $file).bak"
    
    # Create backup
    cp "$file" "$backup_file"
    
    # Remove all dark: prefixed classes
    sed -i '' 's/dark:[^ ]*//g' "$file"
    
    # Fix common white text issues
    # Replace text-white with text-gray-900 (dark text for light background)
    sed -i '' 's/text-white/text-gray-900/g' "$file"
    
    # Fix light gray text that might be hard to read
    sed -i '' 's/text-gray-100/text-gray-800/g' "$file"
    sed -i '' 's/text-gray-200/text-gray-700/g' "$file"
    
    # Fix specific button issues (white text on colored backgrounds should stay)
    # Restore white text for primary buttons
    sed -i '' 's/bg-blue-[0-9]* text-gray-900/bg-blue-600 text-white/g' "$file"
    sed -i '' 's/bg-red-[0-9]* text-gray-900/bg-red-600 text-white/g' "$file"
    sed -i '' 's/bg-green-[0-9]* text-gray-900/bg-green-600 text-white/g' "$file"
    
    echo "✓ Fixed: $file"
}

# Find and fix all TypeScript/React files
find packages/frontend/src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
    # Skip test files and stories
    if [[ ! "$file" =~ \.(test|spec|stories)\.(ts|tsx)$ ]]; then
        # Check if file contains dark: or text-white
        if grep -q -E "(dark:|text-white|text-gray-[12]00)" "$file"; then
            fix_file "$file"
        fi
    fi
done

echo "✅ Dark theme fixes complete!"
echo "📁 Backups saved in .backup-dark-theme/"