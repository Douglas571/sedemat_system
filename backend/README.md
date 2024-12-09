# Payments
* Payments images are saved in /uploads.
* They have a limit size of 5MB


# NOTES

## Install MariaDB Node.js Driver v2
I had to install mariadb node.js drive v2, because the v3 cause error when migrating the database. 

it throw "ERROR: Cannot delete property 'meta' of [object Array]" before undoing associating-doc-images-to-zonations migration.


## Commands
To install single seeds

sequelize db:seed --seed


## ENV. Variables

- IP
- PORT