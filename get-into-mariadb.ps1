# PowerShell script to log into Docker backend container

# Define the container name
$containerName = "mariadb"

# Execute the command to log into the container
docker exec -it $containerName bash

# Note: This script assumes that Docker is installed and the container is running.
# If the container is not running, you may need to start it first using:
# docker start $containerName
