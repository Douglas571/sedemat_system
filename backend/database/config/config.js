const path = require('path'); 

// load .env when is a migration 
if (!process.env.NODE_ENV) { // attempt to read any kay from .env
    // this path will be toke form the dir where is 
    // executed the command for migration 
    console.log("loading .env.migration")
    require('dotenv').config({ path: '.env.migration' });
}
// don't load .env when is running server
console.log({NODE_ENV: process.env.NODE_ENV})

module.exports = {
    dev: {
        env: "dev",
        username: process.env.MARIADB_USER || "sedemat_server",
        password: process.env.MARIADB_PASSWORD || "12345",
        database: process.env.MARIADB_DATABASE_DEV || "sedemat",
        host: process.env.MARIADB_HOST || "mariadb",
        dialect: "mariadb",
        logging: process.env.DB_LOGGING === 'true'
    },
    test: {
        env: "test",
        username: process.env.MARIADB_USER || "sedemat_server",
        password: process.env.MARIADB_PASSWORD || "12345",
        database: process.env.MARIADB_DATABASE_TEST || "sedemat",
        host: process.env.MARIADB_HOST || "mariadb",
        dialect: "mariadb",
        logging: process.env.DB_LOGGING === 'true'
    },
    prod: {
        env: "prod",
        username: process.env.MARIADB_USER || "sedemat_server",
        password: process.env.MARIADB_PASSWORD || "12345",
        database: process.env.MARIADB_DATABASE || "sedemat",
        host: process.env.MARIADB_HOST || "mariadb",
        port: process.env.MARIADB_PORT || "3306",
        dialect: "mariadb",
        logging: process.env.DB_LOGGING === 'true',
        connectTimeout: 10000,
    }
}

