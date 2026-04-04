# Restaurant Platform - Test Directory Setup Script
# This PowerShell script creates all required test directories

# Change to the project directory
Set-Location "D:\restaurant-platform"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "RESTAURANT PLATFORM - TEST DIRECTORY SETUP" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Define the directories to create
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

Write-Host "Creating the following 7 directories:" -ForegroundColor Yellow
for ($i = 0; $i -lt $directories.Length; $i++) {
    Write-Host "  $(($i + 1)). $($directories[$i])" -ForegroundColor Gray
}
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "CREATION PHASE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$created = 0
$failed = @()

foreach ($dir in $directories) {
    $fullPath = Join-Path $basePath $dir
    try {
        if (!(Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
        
        if (Test-Path $fullPath -PathType Container) {
            Write-Host "✓ Created: $dir" -ForegroundColor Green
            $created++
        } else {
            Write-Host "✗ Failed: $dir" -ForegroundColor Red
            $failed += $dir
        }
    } catch {
        Write-Host "✗ Failed: $dir ($_)" -ForegroundColor Red
        $failed += $dir
    }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION PHASE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$verified = 0

foreach ($dir in $directories) {
    $fullPath = Join-Path $basePath $dir
    if (Test-Path $fullPath -PathType Container) {
        Write-Host "✓ VERIFIED: $dir" -ForegroundColor Green
        $verified++
    } else {
        Write-Host "✗ MISSING: $dir" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Created: $created/7"
Write-Host "Verified: $verified/7"
Write-Host ""

if ($verified -eq 7) {
    Write-Host "✓ SUCCESS: All 7 directories created and verified!" -ForegroundColor Green
} else {
    Write-Host "✗ FAILURE: $($7 - $verified) directories are missing" -ForegroundColor Red
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "DIRECTORY TREE - Complete src/test structure" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

function Show-Tree {
    param(
        [string]$Path,
        [string]$Prefix = "",
        [bool]$IsRoot = $true
    )
    
    if (!(Test-Path $Path -PathType Container)) {
        return
    }
    
    $items = @()
    try {
        $items = Get-ChildItem -Path $Path -Force | Where-Object { !$_.Name.StartsWith('.') } | Sort-Object Name
    } catch {
        return
    }
    
    for ($i = 0; $i -lt $items.Count; $i++) {
        $item = $items[$i]
        $isLast = ($i -eq $items.Count - 1)
        $connector = if ($isLast) { "└── " } else { "├── " }
        $extension = if ($isLast) { "    " } else { "│   " }
        
        $itemDisplay = if ($item.PSIsContainer) { "$($item.Name)/" } else { $item.Name }
        Write-Host "$Prefix$connector$itemDisplay" -ForegroundColor Cyan
        
        if ($item.PSIsContainer) {
            Show-Tree -Path $item.FullName -Prefix "$Prefix$extension" -IsRoot $false
        }
    }
}

$testDir = Join-Path $basePath "src\test"
if (Test-Path $testDir -PathType Container) {
    Write-Host "src/test/" -ForegroundColor Yellow
    Show-Tree -Path $testDir -IsRoot $true
} else {
    Write-Host "ERROR: src/test directory not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
