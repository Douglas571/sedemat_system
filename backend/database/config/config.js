const path = require('path'); 

// load .env when is a migration

module.exports = {
    dev: {
        env: "dev",
        username: process.env.MARIADB_USER || "sedemat_server",
        password: process.env.MARIADB_PASSWORD || "12345",
        database: process.env.MARIADB_DATABASE_DEV || "sedemat_dev",
        host: process.env.MARIADB_HOST || "mariadb",
        dialect: "mariadb",
        logging: process.env.DB_LOGGING === 'true',

        port: process.env.MARIADB_PORT ?? 3306
    },
    test: {
        env: "test",
        username: process.env.MARIADB_USER || "sedemat_server",
        password: process.env.MARIADB_PASSWORD || "12345",
        database: process.env.MARIADB_DATABASE_TEST || "sedemat_test",
        host: process.env.MARIADB_HOST || "mariadb",
        dialect: "mariadb",
        logging: process.env.DB_LOGGING === 'true',

        port: process.env.MARIADB_PORT ?? 3306
    },
    prod: {
        env: "prod",
        username: process.env.MARIADB_USER || "sedemat_server",
        password: process.env.MARIADB_PASSWORD || "12345",
        database: process.env.MARIADB_DATABASE || "sedemat",
        host: process.env.MARIADB_HOST || "mariadb",
        dialect: "mariadb",
        logging: process.env.DB_LOGGING === 'true',
        connectTimeout: 10000,

        port: process.env.MARIADB_PORT ?? 3306,
    }
}

