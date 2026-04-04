# Execute the batch file and capture output
Write-Host "Executing FINAL_create_directories.bat..." -ForegroundColor Cyan
$output = & cmd /c "cd /d D:\restaurant-platform && FINAL_create_directories.bat"
Write-Host $output

# Verify directories exist
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Directory Verification" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$directories = @(
    "src\test\resources",
    "src\test\java\com\restaurant\platform\modules\auth",
    "src\test\java\com\restaurant\platform\modules\menu",
    "src\test\java\com\restaurant\platform\modules\order",
    "src\test\java\com\restaurant\platform\modules\loyalty",
    "src\test\java\com\restaurant\platform\modules\notification",
    "src\test\java\com\restaurant\platform\modules\reservation"
)

$results = @()
foreach ($dir in $directories) {
    $fullPath = "D:\restaurant-platform\$dir"
    if (Test-Path $fullPath) {
        Write-Host "[EXISTS] $dir" -ForegroundColor Green
        $results += @{dir=$dir; status="EXISTS"}
    } else {
        Write-Host "[MISSING] $dir" -ForegroundColor Red
        $results += @{dir=$dir; status="MISSING"}
    }
}

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Verification Complete" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
