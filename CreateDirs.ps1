# PowerShell Script to Create Test Directories
# Works with PowerShell 5.0 (built into Windows 10+)
# Run from: D:\restaurant-platform

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

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Creating 7 Test Directories for Restaurant Platform" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Create all directories
foreach ($dir in $directories) {
    $fullPath = Join-Path -Path $basePath -ChildPath $dir
    if (-not (Test-Path -Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "[OK] Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "[OK] Already exists: $dir" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "SUCCESS: All 7 directories created!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Display directory tree
Write-Host "Directory Tree for: D:\restaurant-platform\src\test" -ForegroundColor Cyan
Write-Host ""

$testPath = Join-Path -Path $basePath -ChildPath "src\test"

function Show-Tree {
    param(
        [string]$Path,
        [string]$Prefix = "",
        [bool]$IsLast = $true
    )
    
    $items = @(Get-ChildItem -Path $Path -Directory -ErrorAction SilentlyContinue | Sort-Object Name)
    
    for ($i = 0; $i -lt $items.Count; $i++) {
        $item = $items[$i]
        $isLastItem = ($i -eq $items.Count - 1)
        $connector = if ($isLastItem) { "└── " } else { "├── " }
        
        Write-Host "$Prefix$connector$($item.Name)\" -ForegroundColor Yellow
        
        $newPrefix = $Prefix + (if ($isLastItem) { "    " } else { "│   " })
        Show-Tree -Path $item.FullName -Prefix $newPrefix -IsLast $isLastItem
    }
}

Write-Host "src\test\" -ForegroundColor Yellow
Show-Tree -Path $testPath

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Directory structure display complete." -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
