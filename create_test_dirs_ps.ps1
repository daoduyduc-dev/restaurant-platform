# PowerShell script to create test directories
# Run with: powershell.exe -ExecutionPolicy Bypass -File create_test_dirs.ps1

$basePath = "D:\restaurant-platform"

$directories = @(
    "src\test\resources",
    "src\test\java\com\restaurant\platform\modules\auth",
    "src\test\java\com\restaurant\platform\modules\menu",
    "src\test\java\com\restaurant\platform\modules\order",
    "src\test\java\com\restaurant\platform\modules\loyalty",
    "src\test\java\com\restaurant\platform\modules\notification",
    "src\test\java\com\restaurant\platform\modules\reservation"
)

Write-Host "Creating directory structure...`n"

foreach ($dir in $directories) {
    $fullPath = Join-Path $basePath $dir
    try {
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
        if (Test-Path $fullPath) {
            Write-Host "✓ Created: $dir"
        } else {
            Write-Host "✗ Failed: $dir"
        }
    } catch {
        Write-Host "✗ Failed to create ${dir}: $_"
    }
}

Write-Host "`n$('='*70)"
Write-Host "Verifying directory structure..."
Write-Host "$('='*70)`n"

# Display structure
$testPath = Join-Path $basePath "src\test"
if (Test-Path $testPath) {
    Get-ChildItem -Path $testPath -Recurse -Directory | Select-Object FullName | ForEach-Object {
        $relativePath = $_.FullName -replace [regex]::Escape($testPath), ""
        if ($relativePath) {
            Write-Host $relativePath
        }
    }
}

Write-Host "`n$('='*70)"
Write-Host "Directory creation completed successfully!"
Write-Host "$('='*70)"
