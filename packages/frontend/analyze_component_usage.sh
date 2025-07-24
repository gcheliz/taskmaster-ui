#!/bin/bash

echo "Analyzing React component usage in taskmaster-ui..."
echo "=================================================="
echo ""

# Arrays to store results
declare -a unused_components
declare -a used_components

# Get all component files
components=$(find src/components -name "*.tsx" -type f | grep -v "__tests__" | grep -v ".test." | grep -v ".spec." | sort)

total_count=0
used_count=0

for component_file in $components; do
    total_count=$((total_count + 1))
    component_name=$(basename "$component_file" .tsx)
    
    # Check multiple usage patterns
    usage_found=false
    
    # Pattern 1: Direct imports
    if rg -q "from ['\"].*${component_name}['\"]" src/ --glob '!*.test.*' --glob '!*.spec.*' -g "!${component_file}" 2>/dev/null; then
        usage_found=true
    fi
    
    # Pattern 2: Export from index files
    if ! $usage_found && rg -q "export.*${component_name}" src/components/*/index.ts 2>/dev/null; then
        usage_found=true
    fi
    
    # Pattern 3: Used in JSX
    if ! $usage_found && rg -q "<${component_name}[[:space:/>]" src/ --glob '!*.test.*' --glob '!*.spec.*' -g "!${component_file}" 2>/dev/null; then
        usage_found=true
    fi
    
    # Pattern 4: Referenced as string (for lazy loading, etc)
    if ! $usage_found && rg -q "['\"]${component_name}['\"]" src/routes/ src/App.tsx src/main.tsx 2>/dev/null; then
        usage_found=true
    fi
    
    if $usage_found; then
        used_components+=("$component_file")
        used_count=$((used_count + 1))
    else
        unused_components+=("$component_file")
    fi
done

# Display results organized by directory
echo "UNUSED COMPONENTS:"
echo "=================="

current_dir=""
for component in "${unused_components[@]}"; do
    dir=$(dirname "$component" | sed 's|src/components/||')
    if [ "$dir" != "$current_dir" ]; then
        echo ""
        echo "### $dir/"
        current_dir="$dir"
    fi
    echo "  - $(basename "$component")"
done

# Summary statistics
echo ""
echo ""
echo "SUMMARY:"
echo "========"
echo "Total components analyzed: $total_count"
echo "Used components: $used_count"
echo "Unused components: ${#unused_components[@]}"
echo "Usage rate: $(( (used_count * 100) / total_count ))%"

# Show some examples of used components for verification
echo ""
echo "SAMPLE OF USED COMPONENTS (for verification):"
echo "==========================================="
for i in {0..4}; do
    if [ $i -lt ${#used_components[@]} ]; then
        echo "✓ ${used_components[$i]}"
    fi
done

# Cleanup script files
rm -f check_unused_components.sh find_unused_components.sh check_truly_unused.sh find_unused_final.sh