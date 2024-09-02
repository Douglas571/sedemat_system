# Tax Office Information System


# How to run the project?

## Configuration
Remember to create .env file within the frontend folder with your host IP.
```env
    BACKEND_IP=192.168.1.100
```

## Run the docker containers 
```
docker compose up 
```


## Init Backend
```
docker exec backend sh -c 'npx sequelize db:migrate && npx sequelize db:seed:all'
```


## Backup Mariadb

### Make Backup
To do so, we use mariadb-dump. It will generate a sql file with every sentence we need to replicate our database. 

The container is configure to mount a host volume into /backups folder. The host volume is located into /backups/database-${NODE_ENV}.

```
docker exec -t mariadb sh -c 'mariadb-dump --all-databases -uroot -p"ROOT-PASSWORD" -r "/backups/all-databases.sql"'
```

### Restore Backup
```
docker exec -t mariadb sh -c 'mariadb -uroot -p"ROOT-PASSWORD" < /backups/all-databases.sql'
```

NOTA: This is a base approach, it can be automated with shell scripts or something and rename the dump file for a better organization. 