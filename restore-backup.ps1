# this automation script doesn't work for now

param(
    [Parameter(Mandatory=$true)]
    [string]$Password,

    [Parameter(Mandatory=$true)]
    [string]$BackupFilePath
)

# I need to resolve these path
$currentDir = (Get-Location).Path
$escapedBackupPath = $BackupFilePath -replace '\\', '\\'
$escapedBackupPath = Resolve-Path -Path $escapedBackupPath -Relative $currentDir

$dockerCommand = "docker exec -t mariadb sh -c 'mariadb -uroot -p`"$Password`" < `"$escapedBackupPath`"'"

Write-Host "Executing command: $dockerCommand"
Invoke-Expression $dockerCommand