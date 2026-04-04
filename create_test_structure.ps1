$dirs = @(
    'src\test\resources',
    'src\test\java\com\restaurant\platform\modules\auth',
    'src\test\java\com\restaurant\platform\modules\menu',
    'src\test\java\com\restaurant\platform\modules\order',
    'src\test\java\com\restaurant\platform\modules\loyalty',
    'src\test\java\com\restaurant\platform\modules\notification',
    'src\test\java\com\restaurant\platform\modules\reservation'
)

foreach ($dir in $dirs) {
    $path = Join-Path -Path (Get-Location) -ChildPath $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created: $path"
    } else {
        Write-Host "Already exists: $path"
    }
}

Write-Host "Directory structure created successfully"
