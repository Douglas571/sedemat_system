# Get current timestamp in dd-mm-yyyy-hh-mm format
$timestamp = Get-Date -Format "dd-MM-yyyy-HH-mm"

# Construct the backup filename with timestamp
$backupFileName = "all-databases-$timestamp.sql"

# Execute the Docker command
docker exec -t mariadb sh -c "mariadb-dump --all-databases -uroot -p'12345' -r '/backups/$backupFileName'"

# Output success message
Write-Host "Database backup completed: $backupFileName"