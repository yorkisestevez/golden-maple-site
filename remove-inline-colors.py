#!/usr/bin/env python3
"""
Color System Refactor - Batch HTML Inline Style Removal Script
Removes inline color styles from all HTML files
"""

import os
import re
from pathlib import Path

root_path = Path(r"c:\Users\yorki\OneDrive\Desktop\Golden-maple-site")

# Define replacement patterns
replacements = [
    # Remove inline color styles from navigation
    (r'style="color:\s*var\(--color-gold\);"', 'class="text-gold"'),
    
    # Remove inline color styles with hex values (preserve other styles)
    (r'style="([^"]*?)color:\s*#666;([^"]*)"', r'style="\1\2"'),
    (r'style="([^"]*?)color:\s*#333;([^"]*)"', r'style="\1\2"'),
    (r'style="([^"]*?)color:\s*#555;([^"]*)"', r'style="\1\2"'),
    
    # Remove background inline styles (preserve other styles)
    (r'style="([^"]*?)background:\s*#f9f9f9;([^"]*)"', r'style="\1\2"'),
    (r'style="([^"]*?)background:\s*#fcfbf9;([^"]*)"', r'style="\1\2"'),
    
    # Clean up empty or whitespace-only style attributes
    (r'\s+style=""', ''),
    (r'\s+style="\s+"', ''),
    
    # Replace bg-white class
    (r'class="([^"]*?)\s*bg-white\s*([^"]*)"', r'class="\1 bg-secondary \2"'),
    (r'class="bg-white"', 'class="bg-secondary"'),
]

# Get all HTML files
html_files = list(root_path.glob("**/*.html"))

print(f"Processing {len(html_files)} HTML files...")

updated_count = 0

for file_path in html_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all replacements
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8', newline='') as f:
                f.write(content)
            print(f"✓ Updated: {file_path.relative_to(root_path)}")
            updated_count += 1
        else:
            print(f"- No changes: {file_path.relative_to(root_path)}")
    
    except Exception as e:
        print(f"✗ Error processing {file_path.relative_to(root_path)}: {e}")

print(f"\nCompleted! Updated {updated_count} of {len(html_files)} files.")
