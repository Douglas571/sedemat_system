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

## NOTES 

- there is no proper way to populate all the basic data like categories or
example date (aka Seeds), so you need to start from a preexisting data base.

- the BusinessActivityCategory don't have methods neither controls to add
entries, so you need to add them manually on the database.