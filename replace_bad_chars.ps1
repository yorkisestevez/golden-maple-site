param()
$replacements = @{
    "â€”" = "—"
    "â€“" = "–"
    "â†’" = "→"
    "âœ•" = "✕"
    "â€™" = "’"
    "â€œ" = "“"
    "â€" = "”"
}
Get-ChildItem -Path "C:\Users\yorki\Golden Maple Landscaping with anti gravity" -Recurse -Include *.html,*.htm | ForEach-Object {
    $text = Get-Content -Raw -LiteralPath $_.FullName
    $new = $text
    foreach ($key in $replacements.Keys) {
        $escapedKey = [regex]::Escape($key)
        if ($new -match $escapedKey) {
            $new = $new -replace $escapedKey, $replacements[$key]
        }
    }
    if ($new -ne $text) {
        Set-Content -LiteralPath $_.FullName -Encoding utf8 $new
    }
}
