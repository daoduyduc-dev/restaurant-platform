# Execute the batch file and capture all output
$output = cmd /c "D:\restaurant-platform\FINAL_create_directories.bat" 2>&1
Write-Output $output

# Now verify each directory
Write-Host ""
Write-Host "===================================="
Write-Host "Directory Verification Results"
Write-Host "===================================="

$directories = @(
    "src\test\resources",
    "src\test\java\com\restaurant\platform\modules\auth",
    "src\test\java\com\restaurant\platform\modules\menu",
    "src\test\java\com\restaurant\platform\modules\order",
    "src\test\java\com\restaurant\platform\modules\loyalty",
    "src\test\java\com\restaurant\platform\modules\notification",
    "src\test\java\com\restaurant\platform\modules\reservation"
)

$successful = 0
$failed = 0

foreach ($dir in $directories) {
    $fullPath = Join-Path "D:\restaurant-platform" $dir
    if (Test-Path -Path $fullPath -PathType Container) {
        Write-Host "[EXISTS] $dir"
        $successful++
    } else {
        Write-Host "[MISSING] $dir"
        $failed++
    }
}

Write-Host ""
Write-Host "===================================="
Write-Host "Verification Summary"
Write-Host "===================================="
Write-Host "Total directories checked: 7"
Write-Host "Existing: $successful"
Write-Host "Missing: $failed"
Write-Host "===================================="
