# Color System Refactor - Batch HTML Inline Style Removal Script
# This script removes inline color styles from all HTML files

$rootPath = "c:\Users\yorki\OneDrive\Desktop\Golden-maple-site"

# Define replacement patterns
$replacements = @(
    # Remove inline color styles from navigation
    @{
        Pattern = 'style="color: var\(--color-gold\);"'
        Replacement = 'class="text-gold"'
    },
    # Remove inline color styles with hex values
    @{
        Pattern = 'style="color: #666;([^"]*)"'
        Replacement = 'style="$1"'
    },
    @{
        Pattern = 'style="color: #333;([^"]*)"'
        Replacement = 'style="$1"'
    },
    @{
        Pattern = 'style="color: #555;([^"]*)"'
        Replacement = 'style="$1"'
    },
    # Remove background inline styles
    @{
        Pattern = 'style="background: #f9f9f9;([^"]*)"'
        Replacement = 'style="$1"'
    },
    @{
        Pattern = 'style="background: #fcfbf9;([^"]*)"'
        Replacement = 'style="$1"'
    },
    # Clean up empty style attributes
    @{
        Pattern = '\s+style=""'
        Replacement = ''
    },
    @{
        Pattern = '\s+style="\s*"'
        Replacement = ''
    },
    # Replace bg-white class
    @{
        Pattern = 'class="([^"]*)\s*bg-white\s*([^"]*)"'
        Replacement = 'class="$1 bg-secondary $2"'
    },
    @{
        Pattern = 'class="bg-white"'
        Replacement = 'class="bg-secondary"'
    }
)

# Get all HTML files
$htmlFiles = Get-ChildItem -Path $rootPath -Filter "*.html" -Recurse

Write-Host "Processing $($htmlFiles.Count) HTML files..."

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Apply all replacements
    foreach ($replacement in $replacements) {
        $content = $content -replace $replacement.Pattern, $replacement.Replacement
    }
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Updated"
    } else {
        Write-Host "  - No changes needed"
    }
}

Write-Host ""
Write-Host "Completed processing all HTML files."
